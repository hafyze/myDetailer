import { json } from '@sveltejs/kit';
import { customers } from '$lib/server/db.js';

export async function GET({ url }) {
	const phone = url.searchParams.get('phone');

	if (!phone) {
		return json({ error: 'Phone is required' }, { status: 400 });
	}

	// Check if customer exists
	let customer = customers.find(c => c.phone === phone);

	// If not, create one
	if (!customer) {
		customer = {
			phone,
			name: '',
			vehicles: []
		};

		customers.push(customer);
	}

	return json(customer);
}