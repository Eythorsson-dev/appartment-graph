<script lang="ts">
	import { appState } from '$lib/state.svelte';
	import { calcScenario } from '$lib/financial';
	import ScenarioPanel from '$lib/components/ScenarioPanel.svelte';
	import ChartArea from '$lib/components/ChartArea.svelte';

	let activeTab: 'inputs' | 'chart' = $state('chart');

	const results = $derived(
		appState.scenarios.map((s) => calcScenario(s, appState.global))
	);
</script>

<div class="app">
	<header>
		<div class="header-inner">
			<div class="wordmark">
				<span class="wordmark-serif">Leie</span>
				<span class="wordmark-vs">vs</span>
				<span class="wordmark-serif">Kjøpe</span>
			</div>
			<p class="tagline">Sammenlign scenarioer over tid</p>
		</div>
		<div class="tab-bar">
			<button class:active={activeTab === 'inputs'} onclick={() => (activeTab = 'inputs')}>
				Inputs
			</button>
			<button class:active={activeTab === 'chart'} onclick={() => (activeTab = 'chart')}>
				Graf
			</button>
		</div>
	</header>

	<main>
		<aside class="panel" class:panel--hidden={activeTab === 'chart'}>
			<ScenarioPanel />
		</aside>

		<div class="chart-container" class:chart--hidden={activeTab === 'inputs'}>
			<ChartArea {results} />
		</div>
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		height: 100vh;
		overflow: hidden;
	}

	header {
		border-bottom: 1px solid var(--border);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 12px 20px;
		flex-shrink: 0;
	}

	.header-inner {
		display: flex;
		align-items: baseline;
		gap: 16px;
	}

	.wordmark {
		display: flex;
		align-items: baseline;
		gap: 8px;
	}

	.wordmark-serif {
		font-family: var(--font-display);
		font-size: 22px;
		color: var(--text);
		letter-spacing: -0.02em;
	}

	.wordmark-vs {
		color: var(--text-dim);
		font-size: 11px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.tagline {
		color: var(--text-dim);
		font-size: 11px;
	}

	main {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.panel {
		border-right: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		width: 320px;
		flex-shrink: 0;
	}

	.chart-container {
		flex: 1;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.tab-bar {
		display: none;
	}

	@media (max-width: 768px) {
		.tab-bar {
			display: flex;
			gap: 4px;
		}

		.tab-bar button {
			background: var(--surface);
			border: 1px solid var(--border);
			border-radius: var(--radius);
			color: var(--text-muted);
			padding: 6px 14px;
		}

		.tab-bar button.active {
			background: var(--accent-amber);
			border-color: var(--accent-amber);
			color: var(--bg);
		}

		.panel {
			width: 100%;
		}

		.chart-container {
			width: 100%;
		}

		.panel--hidden {
			display: none;
		}

		.chart--hidden {
			display: none;
		}
	}
</style>
