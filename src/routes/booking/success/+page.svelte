<script>
	import { Button } from "$lib/components/ui/button";
	import { goto } from "$app/navigation";
</script>

<div class="max-w-md mx-auto mt-20 text-center space-y-4">
	<h1 class="text-2xl font-semibold">Booking Confirmed 🎉</h1>
	<p class="text-muted-foreground">
		Your appointment has been successfully booked.
	</p>

	<Button onclick={() => goto("/booking")}>
		Make Another Booking
	</Button>
</div>