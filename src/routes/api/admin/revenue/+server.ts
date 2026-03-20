import { json } from "@sveltejs/kit";
import { getDb, serializeDocument } from "$lib/server/db";

const rangeInDays: Record<string, number> = {
	today: 1,
	"7d": 7,
	"30d": 30,
	this_month: 30
};

function startOfDay(date: Date) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date) {
	return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatDateKey(date: Date) {
	return date.toISOString().slice(0, 10);
}

function normalizeAmount(value: unknown) {
	return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export async function GET({ url, locals }) {
	if (!locals.isAdmin) {
		return json({ message: "Unauthorized" }, { status: 401 });
	}

	const range = url.searchParams.get("range") || "30d";
	const dayWindow = rangeInDays[range] || 30;
	const db = await getDb();
	const now = new Date();
	const todayStart = startOfDay(now);
	const monthStart = startOfMonth(now);
	const rangeStart = new Date(todayStart);
	rangeStart.setDate(rangeStart.getDate() - (dayWindow - 1));

	const paidBookings = await db
		.collection("bookings")
		.find({
			paymentStatus: "paid",
			status: { $ne: "cancelled" }
		})
		.toArray();

	const validPaidBookings = paidBookings.filter((booking) => {
		const amount = normalizeAmount(booking?.service?.price);
		return amount > 0 && typeof booking?.paidAt === "string" && booking.paidAt.trim().length > 0;
	});

	const totalRevenue = validPaidBookings.reduce((sum, booking) => sum + normalizeAmount(booking.service?.price), 0);
	const totalPaidBookings = validPaidBookings.length;
	const averageBookingValue = totalPaidBookings > 0 ? totalRevenue / totalPaidBookings : 0;

	const revenueToday = validPaidBookings.reduce((sum, booking) => {
		const paidAt = new Date(booking.paidAt);
		return paidAt >= todayStart ? sum + normalizeAmount(booking.service?.price) : sum;
	}, 0);

	const revenueThisMonth = validPaidBookings.reduce((sum, booking) => {
		const paidAt = new Date(booking.paidAt);
		return paidAt >= monthStart ? sum + normalizeAmount(booking.service?.price) : sum;
	}, 0);

	const trendSeed = Array.from({ length: dayWindow }, (_, index) => {
		const date = new Date(rangeStart);
		date.setDate(rangeStart.getDate() + index);

		return {
			date: formatDateKey(date),
			revenue: 0,
			bookings: 0
		};
	});

	const trendMap = new Map(trendSeed.map((entry) => [entry.date, entry]));

	for (const booking of validPaidBookings) {
		const dateKey = formatDateKey(new Date(booking.paidAt));

		if (trendMap.has(dateKey)) {
			const entry = trendMap.get(dateKey)!;
			entry.revenue += normalizeAmount(booking.service?.price);
			entry.bookings += 1;
		}
	}

	const recentBookings = validPaidBookings
		.sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())
		.slice(0, 10)
		.map((booking) =>
			serializeDocument({
				id: booking._id,
				customerName: booking.customerName || null,
				serviceName: booking.service?.name || null,
				amount: normalizeAmount(booking.service?.price),
				paymentMethod: booking.paymentMethod || null,
				paidAt: booking.paidAt || null
			})
		);

	return json({
		summary: {
			totalRevenue,
			revenueToday,
			revenueThisMonth,
			totalPaidBookings,
			averageBookingValue
		},
		trend: trendSeed,
		recentBookings
	});
}
