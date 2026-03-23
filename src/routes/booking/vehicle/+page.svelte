<script lang="ts">
	import { Card, CardContent } from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Checkbox } from "$lib/components/ui/checkbox";
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import { booking } from "$lib/stores/booking";
  	import * as Alert from "$lib/components/ui/alert/index";
  	import CheckCircle2 from "@lucide/svelte/icons/check-circle-2";
	import AlertCircle from "@lucide/svelte/icons/alert-circle";
	import Trash2 from "@lucide/svelte/icons/trash-2";
  	import * as AlertDialog  from "$lib/components/ui/alert-dialog/index";

	let data = $state<any>(null);
	booking.subscribe(v => data = v)

	let selectedVehicle = $state<any>(null);

	let alertMessage = $state("");
	let alertType = $state<"success" | "error" | null> (null);
	let deleteTarget = $state<any>(null);
	let deleteOpen = $state(false)

	onMount(() => {
		if (data?.vehicle) {
			selectedVehicle = data.vehicle;
		}
	});

	function selectVehicle(vehicle: any) {
		selectedVehicle = vehicle;
		booking.setVehicle(vehicle);
	}

	async function confirmDelete() {
		if (!deleteTarget) return;

		const vehicleToDelete = deleteTarget

		try {
			const res = await fetch(`/api/vehicle/${vehicleToDelete.id}`, {
				method: "DELETE"
			});
			deleteOpen = false;
			deleteTarget = null;
			if (!res.ok) throw new Error("Failed");

			const updatedCustomer = await res.json();

			booking.setCustomer(updatedCustomer);
			data = {
				...data,
				customer: updatedCustomer
			};

			if (selectedVehicle?.id === vehicleToDelete.id) {
				selectedVehicle = null;
				booking.setVehicle(null);
			}

			alertType = "success";
			alertMessage = "Vehicle deleted successfully.";

		} catch (err) {
			console.error(err);
			alertType = "error";
			alertMessage = "Failed to delete vehicle.";
		}
	}
	
	function handleContinue() {
		if (!selectedVehicle) return;
		goto("/booking/service");
	}
</script>

<div class="max-w-md mx-auto mt-10 space-y-4">

	<h2 class="text-xl font-semibold">Select Your Vehicle</h2>
	{#if alertType}
		<Alert.Root variant={alertType === "error" ? "destructive" : "default"}>
			{#if alertType === "success"}
				<CheckCircle2 />
				<Alert.Title>Success</Alert.Title>
			{:else}
				<AlertCircle />
				<Alert.Title>Error</Alert.Title>
			{/if}

			<Alert.Description>
				{alertMessage}
			</Alert.Description>
		</Alert.Root>
	{/if}
	{#if data?.customer?.vehicles?.length}
		<div class="space-y-3">
			{#each data.customer.vehicles as vehicle (vehicle.id)}
				<div
					role="button"
					tabindex="0"
					onclick={() => selectVehicle(vehicle)}
					onkeydown={(event) => {
						if (event.key === "Enter" || event.key === " ") {
							event.preventDefault();
							selectVehicle(vehicle);
						}
					}}
					class={`group w-full rounded-xl border bg-background p-4 transition flex items-center justify-between cursor-pointer ${
						selectedVehicle?.id === vehicle.id
							? "border-primary ring-2 ring-primary bg-accent text-accent-foreground"
							: "hover:bg-accent/50 hover:text-accent-foreground"
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

					<!-- RIGHT: Actions -->
					<div class="flex items-center gap-2">
						<Checkbox checked={selectedVehicle?.id === vehicle.id} />
						<Button
							size="icon"
							variant="ghost"
							class="text-red-500 hover:text-red-600"
							onclick={(e) => {
								e.stopPropagation();
								deleteTarget = vehicle;
								deleteOpen = true;
							}}>
							<Trash2 class="w-4 h-4" />
						</Button>
					</div>
					
				</div>
			{/each}
		</div>
	{/if}

	<div class="grid grid-cols-2 gap-3">
		<Button variant="outline" class="w-full" onclick={() => goto("/booking")}>
			Back
		</Button>
		<Button variant="success" class="w-full" onclick={() => goto("/booking/vehicle/new")}>
		+ Add New Vehicle
		</Button>
	</div>

	<Button variant="outline" class="w-full" disabled={!selectedVehicle} onclick={handleContinue}>
		Continue
	</Button>

</div>

<!-- Alert Dialog for Delete Vehicle -->

<AlertDialog.Root bind:open={deleteOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>
				Delete Vehicle?
			</AlertDialog.Title>

			<AlertDialog.Description>
				Are you sure you want to delete 
				<strong>
					{deleteTarget?.brand} {deleteTarget?.model} {deleteTarget?.plate}
				</strong>? This action cannot be undone.
			</AlertDialog.Description>
		</AlertDialog.Header>

		<AlertDialog.Footer>
			<AlertDialog.Cancel>
				Cancel
			</AlertDialog.Cancel>

			<AlertDialog.Action
				class="bg-red-500 hover:bg-red-600 text-white"
				onclick={confirmDelete}
			>
				Delete
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>