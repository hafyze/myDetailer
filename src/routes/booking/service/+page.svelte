<script lang="ts">
	import { Card, CardContent } from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Badge } from "$lib/components/ui/badge";
	import { goto } from "$app/navigation";

	import { onMount, tick } from "svelte";
    import { booking } from "$lib/stores/booking";

	let data = $state<any>(null);
    let services = $state<any[]>([]);
	let selectedService = $state<any>(null);
	let loading = $state(true);

	booking.subscribe((value) => {
		data = value;
	});

    onMount(async () => {
		if (data?.service) {
			selectedService = data.service;
		}

		try {
			const res = await fetch("/api/services");

			if (!res.ok) throw new Error("Failed to fetch");

			const data = await res.json();

			services = [...data];

			await tick();
		} catch (err) {
			console.error(err);
			services = [];
		} finally {
			loading = false;
		}
	});

	function handleContinue() {
		if (!selectedService) return;

		goto("/booking/slot");
	}

    function selectService(service: any) {
        selectedService = service;
        booking.setService(service);
    }
</script>

<div class="max-w-md mx-auto mt-10 space-y-4">

	<h2 class="text-xl font-semibold">Select Service</h2>

	{#if data?.vehicle}
		<div class="rounded-xl border bg-background p-4 shadow-sm">
			<p class="text-xs uppercase tracking-wide text-muted-foreground">
				Selected Vehicle
			</p>
			<p class="text-base font-semibold">
				{data.vehicle.brand} {data.vehicle.model}
			</p>
			<p class="text-sm text-muted-foreground">
				{data.vehicle.plate}
			</p>
		</div>

	{/if}

	{#if loading}
		<p class="text-sm text-muted-foreground">Loading services...</p>
	{:else}
		<div class="space-y-3">
			{#each services as service (service._id)}
				<Button
					variant="outline"
					onclick={() => selectService(service)}
					class={`w-full h-auto p-4 flex flex-col items-start gap-2 transition ${
						selectedService?._id === service._id
							? "ring-2 ring-primary border-primary bg-accent"
							: "hover:bg-accent/50"
					}`}
				>
					<!-- Top Row -->
					<div class="flex justify-between w-full">
						<p class="font-medium">{service.name}</p>
						<p class="font-semibold">RM{service.price}</p>
					</div>

					<!-- Duration -->
					<Badge variant="secondary">
						{service.duration} mins
					</Badge>

					<!-- Description -->
					{#if service.description}
						<p class="text-sm text-muted-foreground">
							{service.description}
						</p>
					{/if}
				</Button>
			{/each}
		</div>
	{/if}

	<div class="grid grid-cols-2 gap-3">
		<Button
			variant="outline"
			class="w-full mt-4"
			onclick={() => goto("/booking/vehicle")}
		>
			Back
		</Button>
		<Button
			class="w-full mt-4"
			disabled={!selectedService}
			onclick={() => goto("/booking/slot")}
		>
			Continue
		</Button>
	</div>

</div>
