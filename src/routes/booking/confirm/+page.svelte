<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Separator } from "$lib/components/ui/separator";
	import { goto } from "$app/navigation";
    import { booking } from "$lib/stores/booking";
    
    let data = $state<any>(null);

    booking.subscribe(value => {
        data = value;
    });

	function proceedToPayment() {
		if (!data.payment?.method) {
			booking.setPaymentMethod("online_transfer");
		}
		goto("/booking/payment");
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
				variant="outline"
				class="w-full mt-4"
				onclick={() => goto("/booking/slot")}
			>
				Back
			</Button>

			<Button
				class="w-full"
				onclick={proceedToPayment}
			>
				Proceed To Payment
			</Button>

		</CardContent>
	</Card>
</div>
