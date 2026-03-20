import { fail, redirect } from "@sveltejs/kit";
import { setAdminSession, validateAdminCredentials } from "$lib/server/admin";

export function load({ locals }) {
	if (locals.isAdmin) {
		throw redirect(303, "/admin/dashboard");
	}
}

export const actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const username = String(formData.get("username") || "").trim();
		const password = String(formData.get("password") || "");

		if (!validateAdminCredentials(username, password)) {
			return fail(400, {
				error: "Invalid admin credentials."
			});
		}

		setAdminSession(cookies, username);
		throw redirect(303, "/admin/dashboard");
	}
};
