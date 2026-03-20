<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { goto } from "$app/navigation";
	import { booking } from "$lib/stores/booking";
	import { onMount } from "svelte";

	let data = $state<any>(null);

	booking.subscribe((value) => {
		data = value;
	});

	onMount(() => {
		if (!data?.completedBooking) {
			goto("/booking");
		}
	});

	function formatPaymentMethod(method: string | undefined) {
		if (method === "online_transfer") return "Online Transfer";
		if (method === "qr") return "QR Payment";
		if (method === "card") return "Card";
		return "Payment";
	}

	function startNewBooking() {
		booking.reset();
		goto("/booking");
	}
</script>

<div class="max-w-md mx-auto mt-20 text-center space-y-4">
	<h1 class="text-2xl font-semibold">Booking Confirmed</h1>
	<p class="text-muted-foreground">
		Your appointment has been successfully booked.
	</p>

	{#if data?.completedBooking}
		<div class="rounded-xl border bg-card p-4 text-left space-y-2">
			<p class="text-sm text-muted-foreground">Payment Method</p>
			<p class="font-medium">{formatPaymentMethod(data.completedBooking.payment?.method)}</p>
			<p class="text-sm text-muted-foreground">Transaction ID</p>
			<p class="font-medium">{data.completedBooking.payment?.transactionId}</p>
			{#if data.completedBooking.payment?.transferReference}
				<p class="text-sm text-muted-foreground">Transfer Reference</p>
				<p class="font-medium">{data.completedBooking.payment.transferReference}</p>
			{/if}
			{#if data.completedBooking.payment?.cardLast4}
				<p class="text-sm text-muted-foreground">Card</p>
				<p class="font-medium">Ending in {data.completedBooking.payment.cardLast4}</p>
			{/if}
			{#if data.completedBooking.payment?.paidAt}
				<p class="text-sm text-muted-foreground">Paid At</p>
				<p class="font-medium">{data.completedBooking.payment.paidAt}</p>
			{/if}
		</div>
	{/if}

	<Button onclick={startNewBooking}>
		Make Another Booking
	</Button>
</div>
