<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { createChart, ColorType, LineStyle, LineSeries } from 'lightweight-charts';
	import type { IChartApi, ISeriesApi, Time } from 'lightweight-charts';
	import type { ScenarioResult, YearlyDataPoint } from '$lib/types';
	import BreakdownPanel from './BreakdownPanel.svelte';

	interface Props {
		results: ScenarioResult[];
	}

	let { results }: Props = $props();

	let container: HTMLDivElement;
	let chart: IChartApi | undefined;
	let seriesMap: Map<string, ISeriesApi<'Line'>> = new Map();
	let hoveredYear: number | null = $state(null);
	let hoveredResults: ScenarioResult[] = $state([]);

	const BASE_YEAR = new Date().getFullYear();

	function formatTime(year: number): Time {
		return `${BASE_YEAR + year}-01-01` as Time;
	}

	function initChart() {
		if (!container) return;
		chart = createChart(container, {
			layout: {
				background: { type: ColorType.Solid, color: '#0f0f0d' },
				textColor: '#5a5855',
				fontFamily: "'JetBrains Mono', monospace",
				fontSize: 11
			},
			grid: {
				vertLines: { color: '#1e1e1a', style: LineStyle.Solid },
				horzLines: { color: '#1e1e1a', style: LineStyle.Solid }
			},
			crosshair: {
				vertLine: { color: '#f59e0b40', width: 1, style: LineStyle.Solid, labelBackgroundColor: '#f59e0b' },
				horzLine: { color: '#f59e0b40', width: 1, style: LineStyle.Solid, labelBackgroundColor: '#1a1a17' }
			},
			rightPriceScale: {
				borderColor: '#2e2e28',
				scaleMargins: { top: 0.1, bottom: 0.1 }
			},
			timeScale: {
				borderColor: '#2e2e28',
				tickMarkFormatter: (time: Time) => {
					const year = parseInt(String(time).slice(0, 4)) - BASE_YEAR;
					return `År ${year}`;
				}
			},
			localization: {
				priceFormatter: (price: number) =>
					new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(price)
			},
			handleScroll: true,
			handleScale: true
		});

		chart.subscribeCrosshairMove((param) => {
			if (!param.time) {
				hoveredYear = null;
				hoveredResults = [];
				return;
			}
			const year = parseInt(String(param.time).slice(0, 4)) - BASE_YEAR;
			hoveredYear = year;
			hoveredResults = results;
		});

		updateSeries();

		const ro = new ResizeObserver(() => {
			if (chart && container) {
				chart.applyOptions({ width: container.clientWidth, height: container.clientHeight });
			}
		});
		ro.observe(container);

		return () => ro.disconnect();
	}

	function updateSeries() {
		if (!chart) return;

		const currentIds = new Set(results.map((r) => r.scenario.id));

		// Remove stale series
		for (const [id, series] of seriesMap.entries()) {
			if (!currentIds.has(id)) {
				chart.removeSeries(series);
				seriesMap.delete(id);
			}
		}

		// Add / update series
		for (const result of results) {
			const { id, color } = result.scenario;
			let series = seriesMap.get(id);

			if (!series) {
				series = chart.addSeries(LineSeries, {
					color,
					lineWidth: 2,
					crosshairMarkerVisible: true,
					crosshairMarkerRadius: 4,
					lastValueVisible: true,
					priceLineVisible: false
				});
				seriesMap.set(id, series);
			} else {
				series.applyOptions({ color });
			}

			const data = result.dataPoints.map((dp) => ({
				time: formatTime(dp.year),
				value: dp.netWorth
			}));
			series.setData(data);
		}

		if (results.length > 0) {
			chart.timeScale().fitContent();
		}
	}

	onMount(() => {
		const cleanup = initChart();
		return cleanup;
	});

	onDestroy(() => {
		chart?.remove();
	});

	$effect(() => {
		// Depend on results
		void results;
		if (chart) updateSeries();
	});
</script>

<div class="chart-area">
	<div class="chart-wrapper">
		<div class="chart-container" bind:this={container}></div>

		{#if results.length === 0}
			<div class="empty-overlay">
				<p class="empty-text">Ingen scenarioer ennå</p>
				<p class="empty-sub">Legg til scenarioer i sidepanelet</p>
			</div>
		{/if}

		<div class="legend">
			{#each results as result}
				<div class="legend-item">
					<span class="legend-dot" style="background:{result.scenario.color}"></span>
					<span class="legend-name">{result.scenario.name}</span>
					{#if result.dataPoints.length > 0}
						<span class="legend-value">
							{new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(result.dataPoints[result.dataPoints.length - 1].netWorth)}
						</span>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	{#if hoveredYear !== null}
		<BreakdownPanel year={hoveredYear} {results} />
	{/if}
</div>

<style>
	.chart-area {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow: hidden;
	}

	.chart-wrapper {
		flex: 1;
		position: relative;
		overflow: hidden;
	}

	.chart-container {
		height: 100%;
		width: 100%;
	}

	.empty-overlay {
		align-items: center;
		display: flex;
		flex-direction: column;
		gap: 8px;
		inset: 0;
		justify-content: center;
		pointer-events: none;
		position: absolute;
	}

	.empty-text {
		color: var(--text-dim);
		font-family: var(--font-display);
		font-size: 18px;
	}

	.empty-sub {
		color: var(--text-dim);
		font-size: 11px;
		opacity: 0.6;
	}

	.legend {
		bottom: 12px;
		display: flex;
		flex-direction: column;
		gap: 4px;
		left: 12px;
		pointer-events: none;
		position: absolute;
	}

	.legend-item {
		align-items: center;
		background: #0f0f0dcc;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		display: flex;
		gap: 6px;
		padding: 4px 8px;
	}

	.legend-dot {
		border-radius: 50%;
		flex-shrink: 0;
		height: 8px;
		width: 8px;
	}

	.legend-name {
		color: var(--text-muted);
		font-size: 11px;
	}

	.legend-value {
		color: var(--text);
		font-size: 11px;
		margin-left: 4px;
	}
</style>
