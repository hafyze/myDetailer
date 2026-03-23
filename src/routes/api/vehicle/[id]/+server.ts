import { json } from "@sveltejs/kit";
import { getDb, serializeDocument } from "$lib/server/db";

export async function DELETE({ params }) {
	const id = params.id;

	if (!id) {
		return json({ message: "Vehicle id is required." }, { status: 400 });
	}

	const db = await getDb();
	const customers = db.collection("customers");
	const customer = await customers.findOne({ "vehicles.id": id });

	if (!customer) {
		return json({ message: "Vehicle not found." }, { status: 404 });
	}

	const nextVehicles = Array.isArray(customer.vehicles)
		? customer.vehicles.filter((vehicle: any) => vehicle?.id !== id)
		: [];

	await customers.updateOne(
		{ _id: customer._id },
		{
			$set: {
				vehicles: nextVehicles,
				updatedAt: new Date()
			}
		}
	);

	const updatedCustomer = await customers.findOne({ _id: customer._id });

	return json(
		serializeDocument({
			...updatedCustomer,
			vehicles: Array.isArray(updatedCustomer?.vehicles) ? updatedCustomer.vehicles : []
		})
	);
}
