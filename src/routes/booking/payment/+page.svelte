<script lang="ts">
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import { booking } from "$lib/stores/booking";
	import { Button } from "$lib/components/ui/button";
	import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { Separator } from "$lib/components/ui/separator";

	type PaymentMethod = "online_transfer" | "card" | "qr";

	let data = $state<any>(null);
	let loading = $state(false);
	let error = $state("");
	let selectedMethod = $state<PaymentMethod>("online_transfer");
	let transferReference = $state("");
	let transferConfirmed = $state(false);
	let cardholderName = $state("");
	let cardNumber = $state("");
	let expiry = $state("");
	let cvv = $state("");
	let qrConfirmed = $state(false);

	booking.subscribe((value) => {
		data = value;
	});

	onMount(() => {
		if (!data?.customer || !data?.vehicle || !data?.service || !data?.date || !data?.slot) {
			goto("/booking");
			return;
		}

		selectedMethod = data.payment?.method || "online_transfer";
		transferReference = data.payment?.details?.transferReference || "";
		transferConfirmed = selectedMethod === "online_transfer" ? Boolean(data.payment?.details?.confirmed) : false;
		cardholderName = data.payment?.details?.cardholderName || "";
		cardNumber = data.payment?.details?.cardNumber || "";
		expiry = data.payment?.details?.expiry || "";
		cvv = data.payment?.details?.cvv || "";
		qrConfirmed = selectedMethod === "qr" ? Boolean(data.payment?.details?.confirmed) : false;
	});

	function setMethod(method: PaymentMethod) {
		selectedMethod = method;
		error = "";
		booking.setPaymentMethod(method);
	}

	function formatPaymentMethod(method: PaymentMethod) {
		if (method === "online_transfer") return "Transfer";
		if (method === "qr") return "QR";
		return "Card";
	}

	function buildPaymentDetails() {
		if (selectedMethod === "online_transfer") {
			return {
				confirmed: transferConfirmed,
				transferReference: transferReference.trim()
			};
		}

		if (selectedMethod === "qr") {
			return {
				confirmed: qrConfirmed
			};
		}

		return {
			cardholderName: cardholderName.trim(),
			cardNumber: cardNumber.trim(),
			expiry: expiry.trim(),
			cvv: cvv.trim()
		};
	}

	function validateDetails() {
		if (selectedMethod === "online_transfer" && !transferConfirmed) {
			return "Please confirm the mock transfer before continuing.";
		}

		if (selectedMethod === "qr" && !qrConfirmed) {
			return "Please confirm the mock QR payment before continuing.";
		}

		if (selectedMethod === "card") {
			const digits = cardNumber.replace(/\s+/g, "");

			if (
				!cardholderName.trim() ||
				!/^\d{12,19}$/.test(digits) ||
				!/^\d{2}\/\d{2}$/.test(expiry.trim()) ||
				!/^\d{3,4}$/.test(cvv.trim())
			) {
				return "Please complete the card details to continue.";
			}
		}

		return "";
	}

	async function submitPayment() {
		error = "";
		const validationError = validateDetails();

		if (validationError) {
			error = validationError;
			return;
		}

		const paymentDetails = buildPaymentDetails();
		booking.setPaymentMethod(selectedMethod);
		booking.setPaymentDetails(paymentDetails);
		booking.setPaymentStatus("processing");
		loading = true;

		try {
			const paymentResponse = await fetch("/api/payment", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					method: selectedMethod,
					amount: Number(data.service?.price || 0),
					bookingSummary: {
						customerName: data.customer?.name,
						customerPhone: data.customer?.phone,
						serviceName: data.service?.name,
						date: data.date,
						timeSlot: data.slot
					},
					details: paymentDetails
				})
			});

			const paymentResult = await paymentResponse.json().catch(() => null);

			if (!paymentResponse.ok) {
				throw new Error(paymentResult?.message || "Mock payment failed.");
			}

			booking.setPaymentResult(paymentResult);

			const bookingResponse = await fetch("/api/bookings", {
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
					timeSlot: data.slot,
					paymentMethod: paymentResult.method,
					paymentStatus: paymentResult.status,
					paymentTransactionId: paymentResult.transactionId,
					paidAt: paymentResult.paidAt
				})
			});

			const bookingResult = await bookingResponse.json().catch(() => null);

			if (!bookingResponse.ok) {
				throw new Error(bookingResult?.message || "Booking creation failed.");
			}

			booking.completeBooking({
				booking: bookingResult.booking,
				payment: paymentResult
			});

			goto("/booking/success");
		} catch (err) {
			console.error(err);
			booking.setPaymentStatus("idle");
			error = err instanceof Error ? err.message : "Unable to complete payment right now.";
		} finally {
			loading = false;
		}
	}
</script>

<div class="max-w-md mx-auto mt-10 space-y-4">
	<Card>
		<CardHeader>
			<CardTitle>Payment</CardTitle>
		</CardHeader>

		<CardContent class="space-y-4">
			<div class="space-y-1">
				<p class="text-sm text-muted-foreground">Customer</p>
				<p class="font-medium">{data?.customer?.name}</p>
				<p class="text-sm text-muted-foreground">Service</p>
				<p class="font-medium">{data?.service?.name}</p>
				<p class="text-sm text-muted-foreground">Appointment</p>
				<p class="font-medium">{data?.date} at {data?.slot}</p>
			</div>

			<Separator />

			<div class="space-y-2">
				<p class="text-sm text-muted-foreground">Select Payment Method</p>
				<div class="grid grid-cols-3 gap-2">
					{#each ["online_transfer", "card", "qr"] as method}
						<Button
							type="button"
							variant="outline"
							class={selectedMethod === method ? "border-primary ring-2 ring-primary bg-accent" : ""}
							onclick={() => setMethod(method as PaymentMethod)}
						>
							{formatPaymentMethod(method as PaymentMethod)}
						</Button>
					{/each}
				</div>
			</div>

			{#if selectedMethod === "online_transfer"}
				<div class="space-y-3 rounded-xl border p-4">
					<div>
						<p class="text-sm text-muted-foreground">Bank</p>
						<p class="font-medium">Mock Bank Berhad</p>
					</div>
					<div>
						<p class="text-sm text-muted-foreground">Account Number</p>
						<p class="font-medium">1234 5678 9012</p>
					</div>
					<div>
						<p class="text-sm text-muted-foreground">Reference</p>
						<p class="font-medium">BOOK-{data?.customer?.phone}</p>
					</div>
					<div class="space-y-2">
						<Label for="transferReference">Transfer Reference (Optional)</Label>
						<Input id="transferReference" bind:value={transferReference} placeholder="TRX123456" />
					</div>
					<label class="flex items-center gap-2 text-sm">
						<input type="checkbox" bind:checked={transferConfirmed} />
						I have completed the mock transfer
					</label>
				</div>
			{/if}

			{#if selectedMethod === "card"}
				<div class="space-y-3 rounded-xl border p-4">
					<div class="space-y-2">
						<Label for="cardholderName">Cardholder Name</Label>
						<Input id="cardholderName" bind:value={cardholderName} placeholder="John Doe" />
					</div>
					<div class="space-y-2">
						<Label for="cardNumber">Card Number</Label>
						<Input id="cardNumber" bind:value={cardNumber} placeholder="4111 1111 1111 1111" inputmode="numeric" />
					</div>
					<div class="grid grid-cols-2 gap-3">
						<div class="space-y-2">
							<Label for="expiry">Expiry</Label>
							<Input id="expiry" bind:value={expiry} placeholder="12/27" />
						</div>
						<div class="space-y-2">
							<Label for="cvv">CVV</Label>
							<Input id="cvv" bind:value={cvv} placeholder="123" inputmode="numeric" />
						</div>
					</div>
				</div>
			{/if}

			{#if selectedMethod === "qr"}
				<div class="space-y-3 rounded-xl border p-4">
					<div class="mx-auto flex h-48 w-48 items-center justify-center rounded-xl border-2 border-dashed text-center text-sm text-muted-foreground">
						Mock QR Code
					</div>
					<p class="text-center text-sm text-muted-foreground">
						Scan this mock QR code with your banking app.
					</p>
					<label class="flex items-center gap-2 text-sm">
						<input type="checkbox" bind:checked={qrConfirmed} />
						I have completed the mock QR payment
					</label>
				</div>
			{/if}

			<div class="flex justify-between">
				<p class="font-medium">Total</p>
				<p class="font-semibold">RM {data?.service?.price}</p>
			</div>

			{#if error}
				<p class="text-sm text-red-500">{error}</p>
			{/if}

			<div class="grid grid-cols-2 gap-3">
				<Button type="button" variant="outline" onclick={() => goto("/booking/confirm")} disabled={loading}>
					Back
				</Button>
				<Button type="button" onclick={submitPayment} disabled={loading}>
					{loading ? "Processing..." : `Pay RM ${data?.service?.price ?? 0}`}
				</Button>
			</div>
		</CardContent>
	</Card>
</div>
