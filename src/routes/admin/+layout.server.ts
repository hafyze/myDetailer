import { redirect } from "@sveltejs/kit";

export function load({ locals, url }) {
	if (!locals.isAdmin && url.pathname !== "/admin/login") {
		throw redirect(303, "/admin/login");
	}

	return {
		isAdmin: locals.isAdmin
	};
}
