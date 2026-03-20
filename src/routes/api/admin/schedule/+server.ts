import { json } from "@sveltejs/kit";
import { getScheduleForDate } from "$lib/server/db";

function getTodayDateString() {
	return new Date().toISOString().slice(0, 10);
}

export async function GET({ url, locals }) {
	if (!locals.isAdmin) {
		return json({ message: "Unauthorized" }, { status: 401 });
	}

	const date = url.searchParams.get("date")?.trim() || getTodayDateString();

	return json({
		date,
		slots: await getScheduleForDate(date)
	});
}
