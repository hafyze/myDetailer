import { json } from "@sveltejs/kit";
import {
	createVehicleId,
	findCustomerByPhone,
	getDb,
	normalizePhone,
	serializeDocument
} from "$lib/server/db";

export async function POST({ request }) {
	const { phone: rawPhone, name: rawName, vehicle: rawVehicle } = await request.json();
	const phone = normalizePhone(rawPhone);
	const name = typeof rawName === "string" ? rawName.trim() : "";
	const brand = typeof rawVehicle?.brand === "string" ? rawVehicle.brand.trim() : "";
	const model = typeof rawVehicle?.model === "string" ? rawVehicle.model.trim() : "";
	const plate = typeof rawVehicle?.plate === "string" ? rawVehicle.plate.trim() : "";

	if (!phone || !brand || !model || !plate) {
		return json({ message: "Phone, brand, model, and plate are required." }, { status: 400 });
	}

	const db = await getDb();
	const customers = db.collection("customers");
	const existingCustomer = await findCustomerByPhone(phone);
	const existingVehicles = Array.isArray(existingCustomer?.vehicles) ? existingCustomer.vehicles : [];
	const normalizedPlate = plate.toUpperCase();
	const duplicateVehicle = existingVehicles.find(
		(vehicle) => typeof vehicle?.plate === "string" && vehicle.plate.toUpperCase() === normalizedPlate
	);

	const vehicle =
		duplicateVehicle || {
			id: createVehicleId(),
			brand,
			model,
			plate,
			createdAt: new Date().toISOString()
		};

	const now = new Date();
	const nextVehicles = duplicateVehicle ? existingVehicles : [...existingVehicles, vehicle];
	const customerIdFilter = existingCustomer ? { _id: existingCustomer._id } : { phone };

	await customers.updateOne(
		customerIdFilter,
		{
			$set: {
				phone,
				vehicles: nextVehicles,
				updatedAt: now,
				...(name ? { name } : {})
			},
			$setOnInsert: {
				createdAt: now
			}
		},
		{ upsert: true }
	);

	const updatedCustomer = await findCustomerByPhone(phone);

	return json(
		serializeDocument({
			...updatedCustomer,
			phone,
			vehicles: Array.isArray(updatedCustomer?.vehicles) ? updatedCustomer.vehicles : []
		})
	);
}
