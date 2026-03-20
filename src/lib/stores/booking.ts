import { writable } from "svelte/store";

type Customer = {
	phone?: string;
	name?: string;
	vehicles?: any[];
};

type PaymentMethod = "online_transfer" | "card" | "qr" | null;

type PaymentState = {
	method: PaymentMethod;
	status: "idle" | "processing" | "paid";
	details: Record<string, any>;
	result: Record<string, any> | null;
};

type CompletedBooking = {
	booking: Record<string, any>;
	payment: Record<string, any>;
};

type BookingState = {
	customer: Customer | null;
	vehicle: any;
	service: any;
	date: string | null;
	slot: string | null;
	payment: PaymentState;
	completedBooking: CompletedBooking | null;
};

const initialPaymentState: PaymentState = {
	method: null,
	status: "idle",
	details: {},
	result: null
};

const initialState: BookingState = {
	customer: null,
	vehicle: null,
	service: null,
	date: null,
	slot: null,
	payment: initialPaymentState,
	completedBooking: null
};

function createBookingStore() {
	const { subscribe, set, update } = writable(initialState);

	return {
		subscribe,

		setCustomer: (customer: Partial<Customer>) =>
			update(b => ({
				...b,
				customer: {
					...b.customer,
					...customer
				}
			})),

		setVehicle: (vehicle: any) =>
			update(b => ({ ...b, vehicle })),

		setService: (service: any) =>
			update(b => ({ ...b, service })),

		setSlot: (date: string, slot: string) =>
			update(b => ({ ...b, date, slot })),

		setPaymentMethod: (method: PaymentMethod) =>
			update(b => ({
				...b,
				payment: {
					method,
					status: "idle",
					details: {},
					result: null
				}
			})),

		setPaymentDetails: (details: Record<string, any>) =>
			update(b => ({
				...b,
				payment: {
					...b.payment,
					details: {
						...b.payment.details,
						...details
					}
				}
			})),

		setPaymentStatus: (status: PaymentState["status"]) =>
			update(b => ({
				...b,
				payment: {
					...b.payment,
					status
				}
			})),

		setPaymentResult: (result: Record<string, any>) =>
			update(b => ({
				...b,
				payment: {
					...b.payment,
					status: "paid",
					result
				}
			})),

		completeBooking: (completedBooking: CompletedBooking) =>
			set({
				...initialState,
				completedBooking
			}),

		reset: () => set(initialState)
	};
}

export const booking = createBookingStore();
