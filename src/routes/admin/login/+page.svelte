<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";

	let { form } = $props<{ form?: { error?: string } }>();
</script>

<div class="mx-auto max-w-md pt-12">
	<Card>
		<CardHeader>
			<CardTitle>Admin Login</CardTitle>
		</CardHeader>
		<CardContent>
			<form method="POST" class="space-y-4">
				<div class="space-y-2">
					<Label for="username">Username</Label>
					<Input id="username" name="username" autocomplete="username" />
				</div>
				<div class="space-y-2">
					<Label for="password">Password</Label>
					<Input id="password" name="password" type="password" autocomplete="current-password" />
				</div>

				{#if form?.error}
					<p class="text-sm text-red-500">{form.error}</p>
				{/if}

				<Button class="w-full" type="submit">
					Sign In
				</Button>
			</form>
		</CardContent>
	</Card>
</div>
