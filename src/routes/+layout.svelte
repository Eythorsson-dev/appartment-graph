<script lang="ts">
	import { onMount } from 'svelte';
	import { initUrlSync } from '$lib/state.svelte';

	let { children } = $props();

	onMount(() => {
		return initUrlSync();
	});
</script>

<svelte:head>
	<title>Leie vs. Kjøpe</title>
	<meta name="description" content="Grafisk sammenligning av å leie kontra å kjøpe bolig i Norge" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

{@render children()}

<style>
	:global(*) {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}

	:global(:root) {
		--bg: #0f0f0d;
		--surface: #1a1a17;
		--surface-2: #252520;
		--border: #2e2e28;
		--border-light: #3a3a33;
		--text: #f0ede6;
		--text-muted: #8a8880;
		--text-dim: #5a5855;
		--accent-amber: #f59e0b;
		--accent-sage: #6ee7b7;
		--font-display: 'DM Serif Display', Georgia, serif;
		--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
		--radius: 4px;
		--radius-lg: 8px;
	}

	:global(body) {
		background: var(--bg);
		color: var(--text);
		font-family: var(--font-mono);
		font-size: 13px;
		line-height: 1.5;
		min-height: 100vh;
		-webkit-font-smoothing: antialiased;
	}

	:global(input[type='number'],
	input[type='text'],
	select) {
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		color: var(--text);
		font-family: var(--font-mono);
		font-size: 13px;
		padding: 6px 8px;
		width: 100%;
		outline: none;
		transition: border-color 0.15s;
	}

	:global(input[type='number']:focus,
	input[type='text']:focus,
	select:focus) {
		border-color: var(--accent-amber);
	}

	:global(input[type='range']) {
		accent-color: var(--accent-amber);
		width: 100%;
	}

	:global(button) {
		cursor: pointer;
		font-family: var(--font-mono);
		font-size: 12px;
	}

	:global(label) {
		color: var(--text-muted);
		display: block;
		font-size: 11px;
		letter-spacing: 0.05em;
		margin-bottom: 4px;
		text-transform: uppercase;
	}
</style>
