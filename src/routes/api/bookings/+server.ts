import { json } from "@sveltejs/kit";
import { findCustomerByPhone, getDb, normalizePhone, serializeDocument } from "$lib/server/db";

export async function POST({ request }) {
	const body = await request.json();
	const customerPhone = normalizePhone(body?.customerPhone);

	if (!customerPhone || !body?.vehicle || !body?.service || !body?.date || !body?.timeSlot) {
		return json({ message: "Missing required booking fields." }, { status: 400 });
	}

	const db = await getDb();
	const bookings = db.collection("bookings");
	const customers = db.collection("customers");
	const now = new Date();
	const existingCustomer = await findCustomerByPhone(customerPhone);

	const existingBooking = await bookings.findOne({
		date: body.date,
		timeSlot: body.timeSlot,
		status: { $ne: "cancelled" }
	});

	if (existingBooking) {
		return json({ message: "This slot has already been booked." }, { status: 409 });
	}

	await customers.updateOne(
		existingCustomer ? { _id: existingCustomer._id } : { phone: customerPhone },
		{
			$set: {
				phone: customerPhone,
				name: body.customerName || null,
				updatedAt: now
			},
			$setOnInsert: {
				vehicles: [],
				createdAt: now
			}
		},
		{ upsert: true }
	);

	const result = await bookings.insertOne({
		customerName: body.customerName,
		customerPhone,
		vehicle: body.vehicle,
		service: body.service,
		date: body.date,
		timeSlot: body.timeSlot,
		status: "confirmed",
		paymentMethod: body.paymentMethod || null,
		paymentStatus: body.paymentStatus || null,
		paymentTransactionId: body.paymentTransactionId || null,
		paidAt: body.paidAt || null,
		createdAt: now,
		updatedAt: now
	});

	return json({
		ok: true,
		id: result.insertedId.toString(),
		booking: serializeDocument({
			_id: result.insertedId,
			customerName: body.customerName || null,
			customerPhone,
			vehicle: body.vehicle,
			service: body.service,
			date: body.date,
			timeSlot: body.timeSlot,
			status: "confirmed",
			paymentMethod: body.paymentMethod || null,
			paymentStatus: body.paymentStatus || null,
			paymentTransactionId: body.paymentTransactionId || null,
			paidAt: body.paidAt || null,
			createdAt: now,
			updatedAt: now
		})
	});
}
