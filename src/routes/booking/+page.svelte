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
	let name = $state("")
	let loading = false;
	let error = "";

	const t = $derived((key: string) => {
		const keys = key.split(".");
		let value: any = translations[$language];

		for (const k of keys) {
			value = value?.[k];
		}

		return value || key;
	});

    async function handleContinue() {
        const res = await fetch(`/api/customer?phone=${phone}`);
        const data = await res.json();

        booking.setCustomer({
			...data,
			name
		});

        goto("/booking/vehicle");
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
					type="number"
					bind:value={phone}
				/>

				<Label for="phone">{t("booking.name")}</Label>
				<Input
					id="name"
					placeholder="Full Name"
					bind:value={name}
				/>
			</div>

			{#if error}
				<p class="text-sm text-red-500">{error}</p>
			{/if}

			<Button
				class="w-full"
				onclick={handleContinue}
				disabled={loading}
			>
				{loading ? t("common.loading") : t("common.continue")}
			</Button>

		</CardContent>
	</Card>
</div>