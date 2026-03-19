import { json } from '@sveltejs/kit';

const services = [
	{
		_id: "svc001",
		name: "Premium Wash",
		price: 35,
		duration: 45,
		description: "Exterior wash + interior vacuum"
	},
	{
		_id: "svc002",
		name: "Full Detail",
		price: 120,
		duration: 120,
		description: "Deep cleaning + polish"
	},
	{
		_id: "svc003",
		name: "Wax Protection",
		price: 80,
		duration: 60,
		description: "Adds shine and protection"
	}
];

export async function GET() {
	return json(services);
}