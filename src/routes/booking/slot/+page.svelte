<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { goto } from "$app/navigation";
	import Label from "$lib/components/ui/label/label.svelte";
	import Input from "$lib/components/ui/input/input.svelte";
	import { booking } from "$lib/stores/booking";

	let selectedDate = $state("");
	let selectedSlot = $state<string | null>(null);
	let slots = $state<any[]>([]);
	let loading = $state(false);

	async function fetchSlots() {
		if (!selectedDate) return;

		loading = true;
		selectedSlot = null;

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
			oninput={fetchSlots}
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
		class="w-full mt-4"
		disabled={!selectedSlot}
		onclick={handleContinue}
	>
		Continue
	</Button>

</div>