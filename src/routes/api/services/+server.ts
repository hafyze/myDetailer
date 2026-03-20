import { json } from "@sveltejs/kit";
import { ensureServicesSeeded, serializeDocument } from "$lib/server/db";

export async function GET() {
	const services = await ensureServicesSeeded();
	const allServices = await services.find({}, { sort: { price: 1, name: 1 } }).toArray();

	return json(serializeDocument(allServices));
}
