<script lang="ts">
	import type { ScenarioResult } from '$lib/types';

	interface Props {
		year: number;
		results: ScenarioResult[];
	}

	let { year, results }: Props = $props();

	function fmt(v: number | undefined): string {
		if (v === undefined || isNaN(v)) return '—';
		return new Intl.NumberFormat('nb-NO', {
			style: 'currency',
			currency: 'NOK',
			maximumFractionDigits: 0
		}).format(v);
	}

	function getDataAtYear(result: ScenarioResult, y: number) {
		return result.dataPoints.find((dp) => dp.year === y);
	}
</script>

<div class="breakdown">
	<div class="breakdown-header">
		<span class="year-label">År {year}</span>
	</div>
	<div class="breakdown-grid">
		{#each results as result}
			{@const dp = getDataAtYear(result, year)}
			{#if dp}
				<div class="scenario-col">
					<div class="scenario-name">
						<span class="dot" style="background:{result.scenario.color}"></span>
						{result.scenario.name}
					</div>
					<div class="metric primary">
						<span class="metric-label">Nettoverdi</span>
						<span class="metric-value">{fmt(dp.netWorth)}</span>
					</div>
					<div class="metric">
						<span class="metric-label">Portefølje</span>
						<span class="metric-value">{fmt(dp.portfolioValue)}</span>
					</div>
					{#if result.scenario.type === 'buy' && dp.homeEquity !== undefined}
						<div class="metric">
							<span class="metric-label">Boligverdi</span>
							<span class="metric-value">{fmt(dp.propertyValue)}</span>
						</div>
						<div class="metric">
							<span class="metric-label">Egenkapital (bolig)</span>
							<span class="metric-value">{fmt(dp.homeEquity)}</span>
						</div>
						{#if dp.personalMortgageRemaining}
							<div class="metric dim">
								<span class="metric-label">Gjenstående lån</span>
								<span class="metric-value">{fmt(dp.personalMortgageRemaining)}</span>
							</div>
						{/if}
						{#if dp.fellesgjeldRemaining}
							<div class="metric dim">
								<span class="metric-label">Gjenstående fellesgjeld</span>
								<span class="metric-value">{fmt(dp.fellesgjeldRemaining)}</span>
							</div>
						{/if}
					{/if}
				</div>
			{/if}
		{/each}
	</div>
</div>

<style>
	.breakdown {
		background: var(--surface);
		border-top: 1px solid var(--border);
		flex-shrink: 0;
		max-height: 180px;
		overflow-x: auto;
	}

	.breakdown-header {
		align-items: center;
		border-bottom: 1px solid var(--border);
		display: flex;
		gap: 12px;
		padding: 6px 14px;
	}

	.year-label {
		color: var(--accent-amber);
		font-size: 11px;
		letter-spacing: 0.05em;
	}

	.breakdown-grid {
		display: flex;
		gap: 0;
	}

	.scenario-col {
		border-right: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 180px;
		padding: 10px 14px;
	}

	.scenario-col:last-child {
		border-right: none;
	}

	.scenario-name {
		align-items: center;
		color: var(--text);
		display: flex;
		font-size: 11px;
		gap: 6px;
		margin-bottom: 4px;
	}

	.dot {
		border-radius: 50%;
		flex-shrink: 0;
		height: 7px;
		width: 7px;
	}

	.metric {
		display: flex;
		justify-content: space-between;
		gap: 8px;
	}

	.metric.primary .metric-value {
		color: var(--text);
		font-size: 12px;
	}

	.metric.dim .metric-value,
	.metric.dim .metric-label {
		color: var(--text-dim);
	}

	.metric-label {
		color: var(--text-muted);
		font-size: 10px;
		letter-spacing: 0.03em;
		white-space: nowrap;
	}

	.metric-value {
		color: var(--text-muted);
		font-size: 11px;
		white-space: nowrap;
	}
</style>
