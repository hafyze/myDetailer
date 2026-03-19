import { json } from '@sveltejs/kit';

// temp storage
let bookings: any[] = [];

export async function POST({ request }) {
	const data = await request.json();

	const booking = {
		id: crypto.randomUUID(),
		...data,
		status: "confirmed",
		createdAt: new Date().toISOString()
	};

	bookings.push(booking);

	return json({ success: true, booking });
}