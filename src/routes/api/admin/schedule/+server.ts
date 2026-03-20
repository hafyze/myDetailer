import { json } from "@sveltejs/kit";
import { getScheduleForDate } from "$lib/server/db";

function getTodayDateString() {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
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
