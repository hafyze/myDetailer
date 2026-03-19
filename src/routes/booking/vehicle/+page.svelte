<script lang="ts">
	import { Card, CardContent } from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Checkbox } from "$lib/components/ui/checkbox";
	import { goto } from "$app/navigation";
	import { booking } from "$lib/stores/booking";

	let customer = JSON.parse(localStorage.getItem("customer") || "{}");

	let selectedVehicle = $state<any>(null);

	function selectVehicle(vehicle: any) {
		selectedVehicle = vehicle;
		booking.setVehicle(vehicle);
	}
	
	function handleContinue() {
		if (!selectedVehicle) return;
		goto("/booking/service");
	}
</script>

<div class="max-w-md mx-auto mt-10 space-y-4">

	<h2 class="text-xl font-semibold">Select Your Vehicle</h2>

	{#if customer?.vehicles?.length}
		<div class="space-y-3">
			{#each customer.vehicles as vehicle (vehicle.id)}
				<Button
					type="button"
					onclick={() => selectVehicle(vehicle)}
					class={`w-full h-auto p-4 rounded-xl border transition flex items-center justify-between ${
						selectedVehicle?.id === vehicle.id
							? "border-primary ring-2 ring-primary bg-accent"
							: "hover:bg-accent/50"
					}`}
				>
					<!-- LEFT: Vehicle Info -->
					<div class="flex flex-col items-start text-left">
						<p class="font-medium text-base">
							{vehicle.model}
						</p>
						<p class="text-sm text-muted-foreground">
							{vehicle.plate}
						</p>
					</div>

					<!-- RIGHT: Checkbox -->
					<Checkbox
						checked={selectedVehicle?.id === vehicle.id}
					/>
				</Button>
			{/each}
		</div>
	{/if}

	<Button variant="outline" class="w-full" onclick={() => goto("/booking/vehicle/new")}>
		+ Add New Vehicle
	</Button>

	<Button class="w-full" disabled={!selectedVehicle} onclick={handleContinue}>
		Continue
	</Button>

</div>