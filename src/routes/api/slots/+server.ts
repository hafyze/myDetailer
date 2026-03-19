import { json } from '@sveltejs/kit';

// dummy bookings
let bookings = [
	{ date: "2026-03-20", timeSlot: "11:00" },
	{ date: "2026-03-20", timeSlot: "11:00" }
];

const ALL_SLOTS = ["10:00", "11:00", "12:00", "13:00"];

export async function GET({ url }) {
	const date = url.searchParams.get('date');

	const slotCount: Record<string, number> = {};

	bookings.forEach(b => {
		if (b.date === date) {
			slotCount[b.timeSlot] = (slotCount[b.timeSlot] || 0) + 1;
		}
	});

	const slots = ALL_SLOTS.map(time => ({
		time,
		available: (slotCount[time] || 0) < 2 // capacity = 2
	}));

	return json(slots);
}