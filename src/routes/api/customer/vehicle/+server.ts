import { json } from '@sveltejs/kit';
import { customers } from '$lib/server/db';

export async function POST({ request }) {
	const { phone, vehicle } = await request.json();

	if (!phone || !vehicle) {
		return json({ error: "Missing data" }, { status: 400 });
	}

	// find customer
	let customer = customers.find(c => c.phone === phone);

	if (!customer) {
		customer = {
			phone,
			vehicles: []
		};
		customers.push(customer);
	}

	// add vehicle
	customer.vehicles.push({
		id: crypto.randomUUID(),
		...vehicle
	});

	return json({ success: true, vehicles: customer.vehicles });
}