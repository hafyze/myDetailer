<script lang="ts">
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";
	import { Label } from "$lib/components/ui/label";
	import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
	import { goto } from "$app/navigation";

	let brand = "";
	let model = "";
	let plate = "";

	async function saveVehicle() {
		const customer = JSON.parse(localStorage.getItem("customer") || "{}");

		await fetch("/api/customer/vehicle", {
			method: "POST",
			body: JSON.stringify({
				phone: customer.phone,
				vehicle: { brand, model, plate }
			})
		});

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

			<Button class="w-full" onclick={saveVehicle}>
				Save & Continue
			</Button>

		</CardContent>
	</Card>
</div>