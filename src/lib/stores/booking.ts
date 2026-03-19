import { writable } from "svelte/store";

type Customer = {
	phone?: string;
	name?: string;
	vehicles?: any[];
};

type BookingState = {
	customer: Customer | null;
	vehicle: any;
	service: any;
	date: string | null;
	slot: string | null;
};


const initialState: BookingState = {
	customer: null,
	vehicle: null,
	service: null,
	date: null,
	slot: null
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

		reset: () => set(initialState)
	};
}

export const booking = createBookingStore();