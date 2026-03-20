import { env } from "$env/dynamic/private";
import { redirect, type Cookies } from "@sveltejs/kit";
import { createHmac, timingSafeEqual } from "node:crypto";

const ADMIN_SESSION_COOKIE = "admin_session";
const DEFAULT_ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_PASSWORD = "changeme";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function getAdminCredentials() {
	return {
		username: env.ADMIN_USERNAME || DEFAULT_ADMIN_USERNAME,
		password: env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD,
		secret: env.ADMIN_SESSION_SECRET || `${env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD}-session-secret`
	};
}

function createSessionValue(username: string, secret: string) {
	const signature = createHmac("sha256", secret).update(username).digest("hex");
	return `${username}.${signature}`;
}

export function validateAdminCredentials(username: string, password: string) {
	const config = getAdminCredentials();
	return username === config.username && password === config.password;
}

export function setAdminSession(cookies: Cookies, username: string) {
	const { secret } = getAdminCredentials();
	const value = createSessionValue(username, secret);

	cookies.set(ADMIN_SESSION_COOKIE, value, {
		path: "/",
		httpOnly: true,
		sameSite: "lax",
		secure: false,
		maxAge: SESSION_TTL_SECONDS
	});
}

export function clearAdminSession(cookies: Cookies) {
	cookies.delete(ADMIN_SESSION_COOKIE, {
		path: "/"
	});
}

export function isAdminAuthenticated(cookies: Cookies) {
	const session = cookies.get(ADMIN_SESSION_COOKIE);

	if (!session) {
		return false;
	}

	const [username, signature] = session.split(".");

	if (!username || !signature) {
		return false;
	}

	const { secret } = getAdminCredentials();
	const expected = createSessionValue(username, secret).split(".")[1];

	try {
		return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
	} catch {
		return false;
	}
}

export function requireAdmin(cookies: Cookies) {
	if (!isAdminAuthenticated(cookies)) {
		throw redirect(303, "/admin/login");
	}
}
