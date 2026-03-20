<script lang="ts">
	import { onMount } from "svelte";
	import { Badge } from "$lib/components/ui/badge";
	import { Button } from "$lib/components/ui/button";
	import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
	import { Input } from "$lib/components/ui/input";

	type RevenueData = {
		summary: {
			totalRevenue: number;
			revenueToday: number;
			revenueThisMonth: number;
			totalPaidBookings: number;
			averageBookingValue: number;
		};
		trend: Array<{
			date: string;
			revenue: number;
			bookings: number;
		}>;
		recentBookings: Array<{
			id: string;
			customerName: string | null;
			serviceName: string | null;
			amount: number;
			paymentMethod: string | null;
			paidAt: string | null;
		}>;
	};

	type ScheduleData = {
		date: string;
		slots: Array<{
			time: string;
			available: boolean;
			booking: null | {
				id: string;
				customerName: string | null;
				customerPhone: string | null;
				vehicle: { brand?: string; model?: string; plate?: string } | null;
				service: { name?: string; price?: number } | null;
				paymentMethod: string | null;
				paymentStatus: string | null;
				status: string | null;
			};
		}>;
	};

	type ScheduleBooking = NonNullable<ScheduleData["slots"][number]["booking"]>;

	const rangeOptions = [
		{ value: "today", label: "Today" },
		{ value: "7d", label: "Last 7 Days" },
		{ value: "30d", label: "Last 30 Days" },
		{ value: "this_month", label: "This Month" }
	] as const;

	const trendSortOptions = [
		{ value: "newest", label: "Newest First" },
		{ value: "oldest", label: "Oldest First" },
		{ value: "highest", label: "Highest Revenue" },
		{ value: "lowest", label: "Lowest Revenue" }
	] as const;

	function getTodayDateString() {
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, "0");
		const day = String(now.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	}

	let selectedRange = $state<(typeof rangeOptions)[number]["value"]>("30d");
	let selectedDate = $state(getTodayDateString());
	let revenueLoading = $state(true);
	let scheduleLoading = $state(true);
	let revenueError = $state("");
	let scheduleError = $state("");
	let revenueData = $state<RevenueData | null>(null);
	let scheduleData = $state<ScheduleData | null>(null);
	let actionLoadingId = $state("");
	let trendSort = $state<(typeof trendSortOptions)[number]["value"]>("newest");

	onMount(async () => {
		await Promise.all([loadRevenue(), loadSchedule()]);
	});

	function formatCurrency(value: number) {
		return new Intl.NumberFormat("en-MY", {
			style: "currency",
			currency: "MYR",
			maximumFractionDigits: 0
		}).format(value || 0);
	}

	function formatPaymentMethod(method: string | null) {
		if (method === "online_transfer") return "Transfer";
		if (method === "qr") return "QR";
		if (method === "card") return "Card";
		return "Unknown";
	}

	function formatPaidAt(value: string | null) {
		if (!value) return "-";
		return new Date(value).toLocaleString("en-MY");
	}

	async function updateBookingStatus(id: string, status: "confirmed" | "completed" | "cancelled") {
		actionLoadingId = `${id}:${status}`;

		try {
			const response = await fetch(`/api/admin/bookings/${id}/status`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ status })
			});
			const payload = await response.json().catch(() => null);

			if (!response.ok) {
				throw new Error(payload?.message || "Unable to update booking status.");
			}

			await Promise.all([loadRevenue(), loadSchedule()]);
		} catch (err) {
			console.error(err);
			scheduleError = err instanceof Error ? err.message : "Unable to update booking status.";
		} finally {
			actionLoadingId = "";
		}
	}

	function vehicleLabel(vehicle: ScheduleBooking["vehicle"] | null) {
		if (!vehicle) return "-";
		const brandModel = [vehicle.brand, vehicle.model].filter(Boolean).join(" ");
		return [brandModel, vehicle.plate].filter(Boolean).join(" / ");
	}

	const maxTrendRevenue = $derived(
		Math.max(...(revenueData?.trend.map((entry) => entry.revenue) || [0]), 1)
	);

	const sortedTrend = $derived.by(() => {
		const trend = [...(revenueData?.trend || [])];

		if (trendSort === "oldest") {
			return trend.sort((a, b) => a.date.localeCompare(b.date));
		}

		if (trendSort === "highest") {
			return trend.sort((a, b) => b.revenue - a.revenue || a.date.localeCompare(b.date));
		}

		if (trendSort === "lowest") {
			return trend.sort((a, b) => a.revenue - b.revenue || a.date.localeCompare(b.date));
		}

		return trend.sort((a, b) => b.date.localeCompare(a.date));
	});

	async function loadRevenue() {
		revenueLoading = true;
		revenueError = "";

		try {
			const response = await fetch(`/api/admin/revenue?range=${selectedRange}`);
			const payload = await response.json().catch(() => null);

			if (!response.ok) {
				throw new Error(payload?.message || "Unable to load revenue data.");
			}

			revenueData = payload;
		} catch (err) {
			console.error(err);
			revenueError = err instanceof Error ? err.message : "Unable to load revenue data.";
		} finally {
			revenueLoading = false;
		}
	}

	async function loadSchedule() {
		scheduleLoading = true;
		scheduleError = "";

		try {
			const response = await fetch(`/api/admin/schedule?date=${selectedDate}`);
			const payload = await response.json().catch(() => null);

			if (!response.ok) {
				throw new Error(payload?.message || "Unable to load schedule.");
			}

			scheduleData = payload;
		} catch (err) {
			console.error(err);
			scheduleError = err instanceof Error ? err.message : "Unable to load schedule.";
		} finally {
			scheduleLoading = false;
		}
	}
</script>

<div class="mx-auto max-w-7xl px-4 py-8 space-y-8">
	<div class="space-y-2">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div>
				<h1 class="text-3xl font-semibold tracking-tight">Admin Dashboard</h1>
				<p class="text-muted-foreground">
					Track paid revenue and daily slot occupancy from current bookings.
				</p>
			</div>
			<form method="POST" action="/admin/logout">
				<Button type="submit" variant="outline">Log Out</Button>
			</form>
		</div>
	</div>

	<section class="space-y-4">
		<div class="flex flex-wrap gap-2">
			{#each rangeOptions as option}
				<Button
					type="button"
					variant={selectedRange === option.value ? "default" : "outline"}
					onclick={async () => {
						selectedRange = option.value;
						await loadRevenue();
					}}
				>
					{option.label}
				</Button>
			{/each}
		</div>

		{#if revenueLoading}
			<p class="text-sm text-muted-foreground">Loading revenue data...</p>
		{:else if revenueError}
			<p class="text-sm text-red-500">{revenueError}</p>
		{:else if revenueData}
			<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
				<Card>
					<CardHeader><CardTitle>Total Revenue</CardTitle></CardHeader>
					<CardContent><p class="text-2xl font-semibold">{formatCurrency(revenueData.summary.totalRevenue)}</p></CardContent>
				</Card>
				<Card>
					<CardHeader><CardTitle>Revenue Today</CardTitle></CardHeader>
					<CardContent><p class="text-2xl font-semibold">{formatCurrency(revenueData.summary.revenueToday)}</p></CardContent>
				</Card>
				<Card>
					<CardHeader><CardTitle>Revenue This Month</CardTitle></CardHeader>
					<CardContent><p class="text-2xl font-semibold">{formatCurrency(revenueData.summary.revenueThisMonth)}</p></CardContent>
				</Card>
				<Card>
					<CardHeader><CardTitle>Paid Bookings</CardTitle></CardHeader>
					<CardContent><p class="text-2xl font-semibold">{revenueData.summary.totalPaidBookings}</p></CardContent>
				</Card>
				<Card>
					<CardHeader><CardTitle>Average Booking</CardTitle></CardHeader>
					<CardContent><p class="text-2xl font-semibold">{formatCurrency(revenueData.summary.averageBookingValue)}</p></CardContent>
				</Card>
			</div>

			<div class="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
				<Card>
					<CardHeader class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
						<CardTitle>Revenue Trend</CardTitle>
						<div class="flex flex-wrap gap-2">
							{#each trendSortOptions as option}
								<Button
									type="button"
									size="sm"
									variant={trendSort === option.value ? "default" : "outline"}
									onclick={() => {
										trendSort = option.value;
									}}
								>
									{option.label}
								</Button>
							{/each}
						</div>
					</CardHeader>
					<CardContent class="space-y-3">
						{#each sortedTrend as point}
							<div class="grid grid-cols-[92px_1fr_auto] items-center gap-3">
								<p class="text-sm text-muted-foreground">{point.date}</p>
								<div class="h-3 rounded-full bg-muted overflow-hidden">
									<div
										class="h-full rounded-full bg-chart-1 transition-all"
										style={`width: ${(point.revenue / maxTrendRevenue) * 100}%`}
									></div>
								</div>
								<p class="text-sm font-medium">{formatCurrency(point.revenue)}</p>
							</div>
						{/each}
					</CardContent>
				</Card>

				<Card>
					<CardHeader><CardTitle>Recent Paid Bookings</CardTitle></CardHeader>
					<CardContent class="space-y-3">
						{#if revenueData.recentBookings.length === 0}
							<p class="text-sm text-muted-foreground">No paid bookings yet.</p>
						{:else}
							{#each revenueData.recentBookings as booking}
								<div class="rounded-xl border p-3 space-y-1">
									<div class="flex items-center justify-between gap-3">
										<p class="font-medium">{booking.customerName || "Unknown Customer"}</p>
										<Badge>{formatCurrency(booking.amount)}</Badge>
									</div>
									<p class="text-sm text-muted-foreground">{booking.serviceName || "Unknown Service"}</p>
									<p class="text-xs text-muted-foreground">
										{formatPaymentMethod(booking.paymentMethod)} / {formatPaidAt(booking.paidAt)}
									</p>
								</div>
							{/each}
						{/if}
					</CardContent>
				</Card>
			</div>
		{/if}
	</section>

	<section class="space-y-4">
		<div class="flex flex-wrap items-end justify-between gap-4">
			<div>
				<h2 class="text-2xl font-semibold">Daily Schedule</h2>
				<p class="text-muted-foreground">See which slots are full and who has booked them.</p>
			</div>

			<div class="flex items-center gap-2">
				<Input type="date" bind:value={selectedDate} />
				<Button type="button" variant="outline" onclick={loadSchedule}>
					Load Day
				</Button>
			</div>
		</div>

		{#if scheduleLoading}
			<p class="text-sm text-muted-foreground">Loading schedule...</p>
		{:else if scheduleError}
			<p class="text-sm text-red-500">{scheduleError}</p>
		{:else if scheduleData}
			<Card>
				<CardHeader>
					<CardTitle>Schedule For {scheduleData.date}</CardTitle>
				</CardHeader>
				<CardContent class="space-y-3">
					<div class="hidden md:grid md:grid-cols-[90px_110px_1.2fr_1fr_1fr_120px] gap-3 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
						<p>Time</p>
						<p>Status</p>
						<p>Customer</p>
						<p>Vehicle</p>
						<p>Service</p>
						<p>Payment</p>
					</div>

					{#each scheduleData.slots as slot}
						<div class={`grid gap-3 rounded-xl border p-3 md:grid-cols-[90px_110px_1.2fr_1fr_1fr_120px] ${slot.available ? "bg-muted/30" : "bg-card"}`}>
							<div>
								<p class="text-xs text-muted-foreground md:hidden">Time</p>
								<p class="font-medium">{slot.time}</p>
							</div>
							<div>
								<p class="text-xs text-muted-foreground md:hidden">Status</p>
								<Badge variant={slot.available ? "secondary" : "default"}>
									{slot.available ? "Available" : "Full"}
								</Badge>
								{#if slot.booking?.status}
									<p class="mt-1 text-xs text-muted-foreground">{slot.booking.status}</p>
								{/if}
							</div>
							<div>
								<p class="text-xs text-muted-foreground md:hidden">Customer</p>
								<p class="font-medium">{slot.booking?.customerName || "-"}</p>
								<p class="text-sm text-muted-foreground">{slot.booking?.customerPhone || ""}</p>
							</div>
							<div>
								<p class="text-xs text-muted-foreground md:hidden">Vehicle</p>
								<p>{vehicleLabel(slot.booking?.vehicle || null)}</p>
							</div>
							<div>
								<p class="text-xs text-muted-foreground md:hidden">Service</p>
								<p>{slot.booking?.service?.name || "-"}</p>
							</div>
							<div>
								<p class="text-xs text-muted-foreground md:hidden">Payment</p>
								<p>{slot.booking ? formatPaymentMethod(slot.booking.paymentMethod) : "-"}</p>
								<p class="text-sm text-muted-foreground">{slot.booking?.paymentStatus || ""}</p>
							</div>
							{#if slot.booking}
								{@const currentBooking = slot.booking}
								<div class="md:col-span-6 flex flex-wrap gap-2 border-t pt-3">
									<Button
										type="button"
										size="sm"
										variant="outline"
										disabled={actionLoadingId !== "" || currentBooking.status === "confirmed"}
										onclick={() => updateBookingStatus(currentBooking.id, "confirmed")}
									>
										{actionLoadingId === `${currentBooking.id}:confirmed` ? "Saving..." : "Mark Confirmed"}
									</Button>
									<Button
										type="button"
										size="sm"
										variant="outline"
										disabled={actionLoadingId !== "" || currentBooking.status === "completed"}
										onclick={() => updateBookingStatus(currentBooking.id, "completed")}
									>
										{actionLoadingId === `${currentBooking.id}:completed` ? "Saving..." : "Mark Completed"}
									</Button>
									<Button
										type="button"
										size="sm"
										variant="outline"
										disabled={actionLoadingId !== "" || currentBooking.status === "cancelled"}
										onclick={() => updateBookingStatus(currentBooking.id, "cancelled")}
									>
										{actionLoadingId === `${currentBooking.id}:cancelled` ? "Saving..." : "Cancel Slot"}
									</Button>
								</div>
							{/if}
						</div>
					{/each}
				</CardContent>
			</Card>
		{/if}
	</section>
</div>
