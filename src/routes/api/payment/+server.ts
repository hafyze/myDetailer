import { json } from "@sveltejs/kit";

const supportedMethods = new Set(["online_transfer", "card", "qr"]);

function createTransactionId() {
	return `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function POST({ request }) {
	const body = await request.json();
	const method = body?.method;
	const amount = Number(body?.amount);
	const details = body?.details ?? {};

	if (!supportedMethods.has(method)) {
		return json({ message: "Unsupported payment method." }, { status: 400 });
	}

	if (!Number.isFinite(amount) || amount <= 0) {
		return json({ message: "Invalid payment amount." }, { status: 400 });
	}

	if (method === "online_transfer" && !details?.confirmed) {
		return json({ message: "Please confirm the transfer before continuing." }, { status: 400 });
	}

	if (method === "qr" && !details?.confirmed) {
		return json({ message: "Please confirm the QR payment before continuing." }, { status: 400 });
	}

	if (method === "card") {
		const cardholderName = typeof details?.cardholderName === "string" ? details.cardholderName.trim() : "";
		const cardNumber = typeof details?.cardNumber === "string" ? details.cardNumber.replace(/\s+/g, "") : "";
		const expiry = typeof details?.expiry === "string" ? details.expiry.trim() : "";
		const cvv = typeof details?.cvv === "string" ? details.cvv.trim() : "";

		if (!cardholderName || !/^\d{12,19}$/.test(cardNumber) || !/^\d{2}\/\d{2}$/.test(expiry) || !/^\d{3,4}$/.test(cvv)) {
			return json({ message: "Please complete the mock card details." }, { status: 400 });
		}
	}

	const paidAt = new Date().toISOString();

	return json({
		ok: true,
		status: "paid",
		transactionId: createTransactionId(),
		method,
		paidAt,
		amount,
		transferReference: details?.transferReference || null,
		cardLast4:
			method === "card" && typeof details?.cardNumber === "string"
				? details.cardNumber.replace(/\s+/g, "").slice(-4)
				: null
	});
}
