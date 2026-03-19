import { writable, get } from "svelte/store";
import { translations } from "./translations";

type Lang = "en" | "ms";

const saved =
	typeof localStorage !== "undefined"
		? (localStorage.getItem("lang") as Lang)
		: "en";

export const language = writable<Lang>(saved || "en");

language.subscribe((value) => {
	if (typeof localStorage !== "undefined") {
		localStorage.setItem("lang", value);
	}
});

export function t(path: string) {
	const lang = get(language);

	const keys = path.split(".");
	let value: any = translations[lang];

	for (const key of keys) {
		value = value?.[key];
	}

	return value || path;
}