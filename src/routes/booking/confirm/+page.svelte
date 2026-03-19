<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Separator } from "$lib/components/ui/separator";
	import { goto } from "$app/navigation";
    import { booking } from "$lib/stores/booking";
    
    let data:any;

    booking.subscribe(value => {
        data = value;
    });

	let loading = false;

	async function confirmBooking() {
		loading = true;

		try {
			await fetch("/api/payment", { method: "POST" });

			await fetch("/api/bookings", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					customerName: data.customer?.name,
					customerPhone: data.customer?.phone,
					vehicle: data.vehicle,
					service: data.service,
					date: data.date,
					timeSlot: data.slot
				})
			});

			booking.reset();

			goto("/booking/success");
		} catch (err) {
			console.error(err);
		} finally {
			loading = false;
		}
	}
</script>

<div class="max-w-md mx-auto mt-10">
	<Card>
		<CardHeader>
			<CardTitle>Confirm Booking</CardTitle>
		</CardHeader>

		<CardContent class="space-y-4">

			<!-- Name -->
			<div>
				<p class="text-sm text-muted-foreground">Name</p>
				<p class="font-medium">{data.customer?.name}</p>
			</div>
			<Separator />
			
			<!-- Vehicle -->
			<div>
				<p class="text-sm text-muted-foreground">Vehicle</p>
				<p class="font-medium">{data.vehicle?.model} ({data.vehicle?.plate})</p>
			</div>

			<Separator />

			<!-- Service -->
			<div>
				<p class="text-sm text-muted-foreground">Service</p>
				<p class="font-medium">{data.service?.name}</p>
				<p class="text-sm">RM {data.service?.price}</p>
			</div>

			<Separator />

			<!-- Date & Time -->
			<div>
				<p class="text-sm text-muted-foreground">Date & Time</p>
				<p class="font-medium">{data.date} at {data.slot}</p>
			</div>

			<Separator />

			<!-- Total -->
			<div class="flex justify-between">
				<p class="font-medium">Total</p>
				<p class="font-semibold">RM {data.service?.price}</p>
			</div>

			<Button
				class="w-full mt-4"
				onclick={confirmBooking}
				disabled={loading}
			>
				{loading ? "Processing..." : "Confirm Booking"}
			</Button>

		</CardContent>
	</Card>
</div>