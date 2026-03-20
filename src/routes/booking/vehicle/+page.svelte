<script lang="ts">
	import { Card, CardContent } from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Checkbox } from "$lib/components/ui/checkbox";
	import { goto } from "$app/navigation";
	import { booking } from "$lib/stores/booking";

	let data = $state<any>(null);
	booking.subscribe(v => data = v)

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

	{#if data?.customer?.vehicles?.length}
		<div class="space-y-3">
			{#each data.customer.vehicles as vehicle (vehicle.id)}
				<Button
					type="button"
					variant="outline"
					onclick={() => selectVehicle(vehicle)}
					class={`group w-full h-auto p-4 rounded-xl transition flex items-center justify-between ${
						selectedVehicle?.id === vehicle.id
							? "border-primary ring-2 ring-primary bg-accent text-accent-foreground"
							: "hover:bg-accent/50"
					}`}
				>
					<!-- LEFT: Vehicle Info -->
					<div class="flex flex-col items-start text-left">
						<p class="font-medium text-base">
							{vehicle.brand} {vehicle.model}
						</p>
						<p
							class={`text-sm ${
								selectedVehicle?.id === vehicle.id
									? "text-accent-foreground/80"
									: "text-muted-foreground group-hover:text-accent-foreground/80"
							}`}
						>
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
