import { json } from "@sveltejs/kit";

export async function POST() {
	return json({
		ok: true,
		status: "mock-paid"
	});
}
