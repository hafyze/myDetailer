import { env } from "$env/dynamic/private";
import { MongoClient, ServerApiVersion } from "mongodb";

const DEFAULT_DB_NAME = "mydetailer";
const DEFAULT_SLOT_CAPACITY = 1;
const DAILY_SLOT_TIMES = [
	"09:00",
	"10:00",
	"11:00",
	"12:00",
	"13:00",
	"14:00",
	"15:00",
	"16:00",
	"17:00"
] as const;

const DEFAULT_SERVICES = [
	{
		name: "Basic Wash",
		price: 25,
		duration: 45,
		description: "Quick exterior wash and towel dry."
	},
	{
		name: "Interior + Exterior",
		price: 60,
		duration: 90,
		description: "Interior vacuum, wipe-down, and full exterior wash."
	},
	{
		name: "Premium Detailing",
		price: 150,
		duration: 180,
		description: "Deep cleaning, polishing, and interior detailing."
	}
] as const;

const mongoUri = env.MONGODB_URI;
const databaseName = env.MONGODB_DB_NAME || DEFAULT_DB_NAME;

if (!mongoUri) {
	throw new Error("MONGODB_URI is not set. Add it to your environment variables.");
}

declare global {
	var __mongoClientPromise__: Promise<MongoClient> | undefined;
}

const clientPromise =
	globalThis.__mongoClientPromise__ ||
	new MongoClient(mongoUri, {
		serverApi: {
			version: ServerApiVersion.v1,
			strict: true,
			deprecationErrors: true
		}
	}).connect();

if (!globalThis.__mongoClientPromise__) {
	globalThis.__mongoClientPromise__ = clientPromise;
}

export async function getDb() {
	const client = await clientPromise;
	return client.db(databaseName);
}

export function serializeDocument<T>(value: T): T {
	return JSON.parse(
		JSON.stringify(value, (_key, currentValue) => {
			if (currentValue instanceof Date) {
				return currentValue.toISOString();
			}

			if (currentValue && typeof currentValue === "object" && "_bsontype" in currentValue) {
				return currentValue.toString();
			}

			return currentValue;
		})
	);
}

export function createVehicleId() {
	return crypto.randomUUID();
}

export function normalizePhone(value: unknown) {
	if (value === null || value === undefined) {
		return "";
	}

	return String(value).replace(/\s+/g, "").trim();
}

export function getPhoneLookupCandidates(value: unknown) {
	const normalizedPhone = normalizePhone(value);

	if (!normalizedPhone) {
		return [];
	}

	const withoutLeadingZeros = normalizedPhone.replace(/^0+/, "");

	return Array.from(new Set([normalizedPhone, withoutLeadingZeros].filter(Boolean)));
}

export async function findCustomerByPhone(value: unknown) {
	const candidates = getPhoneLookupCandidates(value);

	if (candidates.length === 0) {
		return null;
	}

	const db = await getDb();

	return db.collection("customers").findOne({
		phone: { $in: candidates }
	});
}

export async function ensureServicesSeeded() {
	const db = await getDb();
	const services = db.collection("services");
	const existingCount = await services.countDocuments();

	if (existingCount === 0) {
		await services.insertMany(
			DEFAULT_SERVICES.map((service) => ({
				...service,
				createdAt: new Date(),
				updatedAt: new Date()
			}))
		);
	}

	return services;
}

export async function getSlotsForDate(date: string) {
	const db = await getDb();
	const bookings = await db
		.collection("bookings")
		.find(
			{ date, status: { $ne: "cancelled" } },
			{
				projection: {
					timeSlot: 1
				}
			}
		)
		.toArray();

	const bookedCountBySlot = bookings.reduce<Record<string, number>>((acc, booking) => {
		const timeSlot =
			typeof booking.timeSlot === "string" && booking.timeSlot.trim().length > 0
				? booking.timeSlot
				: null;

		if (timeSlot) {
			acc[timeSlot] = (acc[timeSlot] || 0) + 1;
		}

		return acc;
	}, {});

	return DAILY_SLOT_TIMES.map((time) => ({
		time,
		available: (bookedCountBySlot[time] || 0) < DEFAULT_SLOT_CAPACITY
	}));
}
