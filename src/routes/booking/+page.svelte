<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "$lib/components/ui/card";
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";
	import { Label } from "$lib/components/ui/label";
	import { booking } from "$lib/stores/booking";
	import { language } from "$lib/i18n";
	import { translations } from "$lib/i18n/translations";

	import { goto } from "$app/navigation";

	let phone = $state("");
	let name = $state("");
	let loading = $state(false);
	let error = $state("");
	let lookupLoading = $state(false);
	let lastLookedUpPhone = $state("");
	let nameWasAutoFilled = $state(false);
	let customerLookupResult = $state<any>(null);

	function normalizePhone(value: unknown) {
		if (value === null || value === undefined) {
			return "";
		}

		let phone = String(value).trim();
		phone = phone.replace(/[\s-]/g, "");

		if (phone.startsWith("+60")) {
			phone = "0" + phone.slice(3)
		}else if (phone.startsWith("60")) {
			phone = "0" + phone.slice(2)
		}else if (!phone.startsWith("0")) {
			phone = "0" + phone
		}

		return phone
	}

	const t = $derived((key: string) => {
		const keys = key.split(".");
		let value: any = translations[$language];

		for (const k of keys) {
			value = value?.[k];
		}

		return value || key;
	});

	async function lookupCustomerByPhone() {
		const normalizedPhone = normalizePhone(phone);

		if (!normalizedPhone || normalizedPhone === lastLookedUpPhone) {
			return null;
		}

		lookupLoading = true;
		error = "";

		try {
			const res = await fetch(`/api/customer?phone=${normalizedPhone}`);

			if (!res.ok) {
				throw new Error("Failed to load customer");
			}

			const data = await res.json();
			lastLookedUpPhone = normalizedPhone;
			customerLookupResult = data;

			if (data?.name) {
				name = data.name;
				nameWasAutoFilled = true;
			} else if (nameWasAutoFilled) {
				name = "";
				nameWasAutoFilled = false;
			}

			return data;
		} catch (err) {
			console.error(err);
			error = "Unable to check customer details right now.";
			return null;
		} finally {
			lookupLoading = false;
		}
	}

	async function handleContinue() {
		loading = true;
		error = "";

		try {
			const normalizedPhone = normalizePhone(phone);
			const data =
				(await lookupCustomerByPhone()) ??
				(lastLookedUpPhone === normalizedPhone ? customerLookupResult : null) ?? {
					phone: normalizedPhone,
					name: "",
					vehicles: []
				};

			booking.setCustomer({
				...data,
				name
			});

			goto("/booking/vehicle");
		} catch (err) {
			console.error(err);
			error = "Unable to continue right now.";
		} finally {
			loading = false;
		}
	}
</script>

<div class="max-w-md mx-auto mt-10">
	<Card>
		<CardHeader>
			<CardTitle>{t("booking.title")}</CardTitle>
			<CardDescription>
				{t("booking.enter_phone")}
			</CardDescription>
		</CardHeader>

		<CardContent class="space-y-4">

			<div class="space-y-2">
				<Label for="phone">{t("booking.phone")}</Label>
				<Input
					id="phone"
					placeholder="0123456789"
					type="tel"
					inputmode="numeric"
					autocomplete="tel"
					bind:value={phone}
					oninput={() => {
						if (normalizePhone(phone) !== lastLookedUpPhone) {
							customerLookupResult = null;
						}

						if (nameWasAutoFilled && normalizePhone(phone) !== lastLookedUpPhone) {
							name = "";
							nameWasAutoFilled = false;
						}
					}}
					onchange={lookupCustomerByPhone}
				/>

				<Label for="phone">{t("booking.name")}</Label>
				<Input
					id="name"
					placeholder="Full Name"
					bind:value={name}
					oninput={() => {
						nameWasAutoFilled = false;
					}}
				/>
			</div>

			{#if error}
				<p class="text-sm text-red-500">{error}</p>
			{/if}

			<Button
				class="w-full"
				onclick={handleContinue}
				disabled={loading || lookupLoading}
			>
				{loading ? t("common.loading") : t("common.continue")}
			</Button>

		</CardContent>
	</Card>
</div>
