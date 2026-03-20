import { json } from "@sveltejs/kit";
import { findCustomerByPhone, normalizePhone, serializeDocument } from "$lib/server/db";

export async function GET({ url }) {
	const phone = normalizePhone(url.searchParams.get("phone"));

	if (!phone) {
		return json({ message: "phone is required" }, { status: 400 });
	}

	const customer = await findCustomerByPhone(phone);

	if (!customer) {
		return json({
			phone,
			name: "",
			vehicles: []
		});
	}

	return json(
		serializeDocument({
			...customer,
			phone,
			vehicles: Array.isArray(customer.vehicles) ? customer.vehicles : []
		})
	);
}
