<script lang="ts">
	import type { InvestmentSettings } from '$lib/types';
	import NumericField from './NumericField.svelte';

	interface Props {
		investment: InvestmentSettings;
	}

	let { investment }: Props = $props();
</script>

<div class="investment-section">
	<div class="section-label">Investering ved siden av</div>
	<div class="fields">
		<div class="field-group">
			<label>Månedlig investering (NOK)</label>
			<NumericField
				value={investment.monthlyContribution}
				min={0}
				step={500}
				onchange={(v) => (investment.monthlyContribution = v)}
			/>
		</div>
		<div class="row">
			<div class="field-group">
				<label>Forventet avkastning</label>
				<NumericField
					value={investment.annualReturn}
					isPercent
					min={0}
					max={0.3}
					step={0.001}
					onchange={(v) => (investment.annualReturn = v)}
				/>
			</div>
			<div class="field-group ask-toggle">
				<label>ASK-konto</label>
				<label class="toggle">
					<input
						type="checkbox"
						checked={investment.useASK}
						onchange={(e) => (investment.useASK = (e.target as HTMLInputElement).checked)}
					/>
					<span class="toggle-label">{investment.useASK ? 'Ja' : 'Nei'}</span>
				</label>
			</div>
		</div>
	</div>
</div>

<style>
	.investment-section {
		border: 1px solid var(--border);
		border-radius: var(--radius);
		margin-top: 4px;
	}

	.section-label {
		border-bottom: 1px solid var(--border);
		color: var(--text-dim);
		font-size: 10px;
		letter-spacing: 0.08em;
		padding: 5px 8px;
		text-transform: uppercase;
	}

	.fields {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 10px;
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

	.toggle {
		align-items: center;
		cursor: pointer;
		display: flex;
		gap: 8px;
		margin-bottom: 0;
		text-transform: none;
		letter-spacing: 0;
		font-size: 13px;
		color: var(--text);
	}

	.toggle input[type='checkbox'] {
		accent-color: var(--accent-amber);
		height: 14px;
		width: 14px;
	}

	.ask-toggle label:first-child {
		color: var(--text-muted);
		font-size: 11px;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}
</style>
