import { json } from "@sveltejs/kit";
import { ObjectId } from "mongodb";
import { getDb } from "$lib/server/db";

const allowedStatuses = new Set(["confirmed", "completed", "cancelled"]);

export async function PATCH({ params, request, locals }) {
	if (!locals.isAdmin) {
		return json({ message: "Unauthorized" }, { status: 401 });
	}

	const id = params.id;
	const body = await request.json();
	const status = typeof body?.status === "string" ? body.status.trim() : "";

	if (!ObjectId.isValid(id)) {
		return json({ message: "Invalid booking id." }, { status: 400 });
	}

	if (!allowedStatuses.has(status)) {
		return json({ message: "Invalid booking status." }, { status: 400 });
	}

	const db = await getDb();
	const result = await db.collection("bookings").findOneAndUpdate(
		{ _id: new ObjectId(id) },
		{
			$set: {
				status,
				updatedAt: new Date()
			}
		},
		{
			returnDocument: "after"
		}
	);

	if (!result) {
		return json({ message: "Booking not found." }, { status: 404 });
	}

	return json({
		ok: true,
		booking: {
			id: result._id.toString(),
			status: result.status
		}
	});
}
