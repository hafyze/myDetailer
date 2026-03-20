import { json } from "@sveltejs/kit";
import { getSlotsForDate } from "$lib/server/db";

export async function GET({ url }) {
	const date = url.searchParams.get("date")?.trim();

	if (!date) {
		return json({ message: "date is required" }, { status: 400 });
	}

	return json(await getSlotsForDate(date));
}
