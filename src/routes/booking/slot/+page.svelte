<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import Label from "$lib/components/ui/label/label.svelte";
	import Input from "$lib/components/ui/input/input.svelte";
	import { booking } from "$lib/stores/booking";

	let data = $state<any>(null);
	let selectedDate = $state("");
	let selectedSlot = $state<string | null>(null);
	let slots = $state<any[]>([]);
	let loading = $state(false);

	booking.subscribe((value) => {
		data = value;
	});

	onMount(async () => {
		if (data?.date) {
			selectedDate = data.date;
			selectedSlot = data.slot;
			await fetchSlots(true);
		}
	});

	async function fetchSlots(preserveSelectedSlot = false) {
		if (!selectedDate) return;

		loading = true;

		if (!preserveSelectedSlot) {
			selectedSlot = null;
		}

		try {
			const res = await fetch(`/api/slots?date=${selectedDate}`);
			slots = await res.json();
			console.log(slots)
		} catch (err) {
			console.error(err);
		} finally {
			loading = false;
		}
	}

	function handleContinue() {
		if (!selectedSlot) return;

		booking.setSlot(selectedDate, selectedSlot);
		goto("/booking/confirm");
	}
</script>

<div class="max-w-md mx-auto mt-10 space-y-5">

	<h2 class="text-xl font-semibold">Select Time Slot</h2>

	<!-- Date Picker -->
	<div class="space-y-2">
		<Label class="text-sm">Choose Date</Label>
		<Input
			type="date"
			bind:value={selectedDate}
			oninput={() => fetchSlots()}
		/>
	</div>

	<!-- Loading -->
	{#if loading}
		<p class="text-sm text-muted-foreground">
			Loading slots...
		</p>
	{/if}

	<!-- Slots -->
	{#if slots.length > 0}
		<div class="grid grid-cols-3 gap-3">
			{#each slots as slot}
				<Button
					type="button"
					variant={slot.available ? "outline" : "secondary"}
					disabled={!slot.available}
					onclick={() => selectedSlot = slot.time}
					class={`h-12 text-sm transition ${
						selectedSlot === slot.time
							? "ring-2 ring-primary border-primary"
							: ""
					}`}
				>
					{slot.time}
				</Button>
			{/each}
		</div>
	{/if}

	<!-- Continue -->
	<Button
		variant="outline"
		class="w-full mt-4"
		onclick={() => goto("/booking/service")}
	>
		Back
	</Button>
	<Button
		class="w-full"
		disabled={!selectedSlot}
		onclick={handleContinue}
	>
		Continue
	</Button>

</div>
