<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher, toggleMode } from 'mode-watcher';
	import SunIcon from "@lucide/svelte/icons/sun";
	import MoonIcon from "@lucide/svelte/icons/moon";
	import Bubbles from "@lucide/svelte/icons/bubbles"
	import Button from '$lib/components/ui/button/button.svelte';

	import { language } from '$lib/stores/language';
	
	let { children } = $props();

	function setLanguage(lang: "en" | "ms") {
		language.set(lang)
		console.log("lang ", lang)
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<ModeWatcher />

<!-- Main Layout -->
<div class="min-h-screen flex flex-col bg-background text-foreground">
	<header class="border-b">
		<div class="container mx-auto flex items-center justify-between h-14 px-4">
			<!-- Logo -->
			<div class="flex font-semibold text-lg items-center gap-1">
				<span>myDetailer</span>
				<Bubbles class="h-5 w-5" />
			</div>

			<!-- Right Controls -->
			<div class="flex items-center gap-2">

				<!-- Language Toggle -->
				<div class="flex gap-1">
					<Button variant="ghost" size="sm" onclick={() => setLanguage("en")}>
						EN
					</Button>
					<Button variant="ghost" size="sm" onclick={() => setLanguage("ms")}>
						BM
					</Button>
				</div>

				<!-- 🌙 Theme Toggle -->
				<Button variant="ghost" size="icon" onclick={toggleMode}>
					<SunIcon class="h-5 w-5 dark:hidden" />
					<MoonIcon class="h-5 w-5 hidden dark:block" />
				</Button>

			</div>
		</div>
	</header>
	<!-- Page Content -->
	<main class="flex-1">
		<div class="container mx-auto px-4 py-6">
			{@render children()}
		</div>
	</main>

	<!-- Footer -->
	<footer class="border-t">
		<div class="container mx-auto px-4 py-4 text-sm text-muted-foreground text-center">
			© {new Date().getFullYear()} DetailFlow
		</div>
	</footer>
</div>
