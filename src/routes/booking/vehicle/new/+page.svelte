<script lang="ts">
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";
	import { Label } from "$lib/components/ui/label";
	import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
	import { goto } from "$app/navigation";
	import { booking } from "$lib/stores/booking";

	let data = $state<any>(null);
	booking.subscribe(v => data = v)

	let brand = $state("");
	let model = $state("");
	let plate = $state("");

	async function saveVehicle() {
		await fetch("/api/customer/vehicle", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				phone: data.customer?.phone,
				name: data.customer?.name,
				vehicle: { brand, model, plate }
			})
		});

		const res = await fetch(`/api/customer?phone=${data.customer?.phone}`);
		const updatedCustomer = await res.json();

		booking.setCustomer(updatedCustomer);

		goto("/booking/vehicle");
	}
</script>

<div class="max-w-md mx-auto mt-10">
	<Card>
		<CardHeader>
			<CardTitle>Add Vehicle</CardTitle>
		</CardHeader>

		<CardContent class="space-y-4">

			<div>
				<Label>Brand</Label>
				<Input bind:value={brand} />
			</div>

			<div>
				<Label>Model</Label>
				<Input bind:value={model} />
			</div>

			<div>
				<Label>Plate</Label>
				<Input bind:value={plate} />
			</div>

			<div class="grid grid-cols-2 gap-3">
				<Button variant="outline" class="w-full" onclick={() => goto("/booking/vehicle")}>
					Back
				</Button>
				<Button variant="success" class="w-full" onclick={saveVehicle}>
				Save & Continue
				</Button>
			</div>

		</CardContent>
	</Card>
</div>
