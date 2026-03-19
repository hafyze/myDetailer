<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Card, CardContent } from "$lib/components/ui/card";
	import { goto } from "$app/navigation";
    import Label from "$lib/components/ui/label/label.svelte";
    import { booking } from "$lib/stores/booking";
  import Input from "$lib/components/ui/input/input.svelte";

	let selectedDate = $state("");
	let selectedSlot = $state<any>(null);
	let slots = $state<any[]>([]);
	let loading = $state(false);

	async function fetchSlots() {
		if (!selectedDate) return;

		loading = true;
		selectedSlot = null;

		try {
			const res = await fetch(`/api/slots?date=${selectedDate}`);
			slots = await res.json();
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

<div class="max-w-md mx-auto mt-10 space-y-4">

	<h2 class="text-xl font-semibold">Select Time Slot</h2>

	<div class="space-y-2">
		<Label class="text-sm">Choose Date</Label>
		<Input
			type="date"
			class="w-full border rounded-md px-3 py-2 bg-background"
			bind:value={selectedDate}
			onchange={fetchSlots}
		/>
	</div>

	{#if loading}
		<p class="text-sm text-muted-foreground">Loading slots...</p>
	{/if}

	<div class="grid grid-cols-3 gap-2">
		{#each slots as slot}
			<Button
				variant={slot.available ? "default" : "secondary"}
				disabled={!slot.available}
				class={`text-sm ${
					selectedSlot === slot.time
						? "ring-2 ring-primary"
						: ""
				}`}
				onclick={() => selectedSlot = slot.time}
			>
				{slot.time}
			</Button>
		{/each}
	</div>

	<!-- Continue -->
	<Button
		class="w-full mt-4"
		disabled={!selectedSlot}
		onclick={handleContinue}
	>
		Continue
	</Button>

</div>