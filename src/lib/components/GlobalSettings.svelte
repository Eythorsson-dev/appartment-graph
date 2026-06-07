<script lang="ts">
	import { appState } from '$lib/state.svelte';
	import NumericField from './NumericField.svelte';

	let expanded = $state(false);
	const g = $derived(appState.global);
</script>

<div class="global-settings">
	<div class="header" onclick={() => (expanded = !expanded)} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && (expanded = !expanded)}>
		<span class="label-text">Globale innstillinger</span>
		<span class="chevron" class:open={expanded}>›</span>
	</div>

	{#if expanded}
		<div class="body">
			<div class="field-group">
				<label for="global-capital">Startkapital (NOK)</label>
				<NumericField
					id="global-capital"
					value={g.startingCapital}
					min={0}
					step={50000}
					onchange={(v) => (appState.global.startingCapital = v)}
				/>
			</div>

			<div class="field-group">
				<label for="global-horizon">Tidshorisont: {g.timeHorizonYears} år</label>
				<input
					id="global-horizon"
					type="range"
					min={5}
					max={40}
					step={1}
					value={g.timeHorizonYears}
					oninput={(e) => (appState.global.timeHorizonYears = Number((e.target as HTMLInputElement).value))}
				/>
			</div>

			<div class="row">
				<div class="field-group">
					<label for="global-inflation">Inflasjon</label>
					<NumericField
						id="global-inflation"
						value={g.inflationRate}
						isPercent
						min={0}
						max={0.2}
						step={0.001}
						onchange={(v) => (appState.global.inflationRate = v)}
					/>
				</div>
				<div class="field-group">
					<label for="global-tax">Skattesats</label>
					<NumericField
						id="global-tax"
						value={g.taxRate}
						isPercent
						min={0}
						max={0.5}
						step={0.01}
						onchange={(v) => (appState.global.taxRate = v)}
					/>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.global-settings {
		border-bottom: 1px solid var(--border);
	}

	.header {
		align-items: center;
		cursor: pointer;
		display: flex;
		justify-content: space-between;
		padding: 10px 14px;
		user-select: none;
	}

	.header:hover {
		background: var(--surface);
	}

	.label-text {
		color: var(--text-muted);
		font-size: 11px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.chevron {
		color: var(--text-dim);
		display: inline-block;
		font-size: 16px;
		line-height: 1;
		transform: rotate(0deg);
		transition: transform 0.2s;
	}

	.chevron.open {
		transform: rotate(90deg);
	}

	.body {
		border-top: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 12px 14px;
	}

	.field-group {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.row {
		display: grid;
		gap: 10px;
		grid-template-columns: 1fr 1fr;
	}
</style>
