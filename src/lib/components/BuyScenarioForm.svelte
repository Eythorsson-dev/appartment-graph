<script lang="ts">
	import type { BuyScenario } from '$lib/types';
	import NumericField from './NumericField.svelte';
	import InvestmentFields from './InvestmentFields.svelte';

	interface Props { scenario: BuyScenario; }
	let { scenario }: Props = $props();

	const nok = (v: number) =>
		new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(v);

	const monthlyPayment = $derived.by(() => {
		const principal = Math.max(0, scenario.listingPrice - scenario.downPayment);
		const r = scenario.interestRate / 12;
		const n = scenario.loanTermYears * 12;
		if (principal <= 0 || n <= 0) return null;

		if (scenario.loanType === 'annuity') {
			const payment = r === 0 ? principal / n : (principal * r) / (1 - Math.pow(1 + r, -n));
			return { type: 'annuity', fixed: payment + scenario.extraMonthlyPayment };
		} else {
			const principalPart = principal / n;
			const firstInterest = principal * r;
			const lastInterest = principalPart * r;
			return {
				type: 'serial',
				first: principalPart + firstInterest + scenario.extraMonthlyPayment,
				last: principalPart + lastInterest + scenario.extraMonthlyPayment
			};
		}
	});

	let showFellesgjeld = $state(false);
	$effect.pre(() => {
		showFellesgjeld = scenario.fellesgjeld > 0 || scenario.propertyType === 'borettslag';
	});
	let showAdvanced = $state(false);
</script>

<div class="form">
	<!-- Property -->
	<div class="section-title">Eiendom</div>

	<div class="row">
		<div class="field-group">
			<label>Prisantydning (NOK)</label>
			<NumericField
				value={scenario.listingPrice}
				min={0}
				step={100000}
				onchange={(v) => (scenario.listingPrice = v)}
			/>
		</div>
		<div class="field-group">
			<label>Eiendomstype</label>
			<select
				value={scenario.propertyType}
				onchange={(e) => {
					scenario.propertyType = (e.target as HTMLSelectElement).value as 'selveier' | 'borettslag';
					if (scenario.propertyType === 'borettslag') showFellesgjeld = true;
				}}
			>
				<option value="selveier">Selveier</option>
				<option value="borettslag">Borettslag</option>
			</select>
		</div>
	</div>

	<div class="field-group">
		<label>Prisvekst per år</label>
		<NumericField
			value={scenario.annualAppreciation}
			isPercent
			min={0}
			max={0.2}
			step={0.001}
			onchange={(v) => (scenario.annualAppreciation = v)}
		/>
	</div>

	<!-- Fellesgjeld toggle -->
	<label class="toggle-row">
		<input
			type="checkbox"
			checked={showFellesgjeld}
			onchange={(e) => {
				showFellesgjeld = (e.target as HTMLInputElement).checked;
				if (!showFellesgjeld) {
					scenario.fellesgjeld = 0;
					scenario.felleskostnaderMonthly = 0;
				}
			}}
		/>
		<span>Fellesgjeld / Borettslag</span>
	</label>

	{#if showFellesgjeld}
		<div class="subsection">
			<div class="row">
				<div class="field-group">
					<label>Fellesgjeld (NOK)</label>
					<NumericField
						value={scenario.fellesgjeld}
						min={0}
						step={50000}
						onchange={(v) => (scenario.fellesgjeld = v)}
					/>
				</div>
				<div class="field-group">
					<label>Rente fellesgjeld</label>
					<NumericField
						value={scenario.fellesgjeldInterestRate}
						isPercent
						min={0}
						max={0.2}
						step={0.001}
						onchange={(v) => (scenario.fellesgjeldInterestRate = v)}
					/>
				</div>
			</div>
			<div class="row">
				<div class="field-group">
					<label>Gjenst. løpetid (år)</label>
					<NumericField
						value={scenario.fellesgjeldRemainingYears}
						min={1}
						max={40}
						step={1}
						onchange={(v) => (scenario.fellesgjeldRemainingYears = v)}
					/>
				</div>
				<div class="field-group">
					<label>Felleskost./mnd (NOK)</label>
					<NumericField
						value={scenario.felleskostnaderMonthly}
						min={0}
						step={100}
						onchange={(v) => (scenario.felleskostnaderMonthly = v)}
					/>
				</div>
			</div>
		</div>
	{/if}

	<!-- Loan -->
	<div class="section-title">Lån</div>

	<div class="field-group">
		<label>Egenkapital (NOK)</label>
		<NumericField
			value={scenario.downPayment}
			min={0}
			step={50000}
			onchange={(v) => (scenario.downPayment = v)}
		/>
	</div>

	<div class="row">
		<div class="field-group">
			<label>Lånetyype</label>
			<select
				value={scenario.loanType}
				onchange={(e) => (scenario.loanType = (e.target as HTMLSelectElement).value as 'annuity' | 'serial')}
			>
				<option value="annuity">Annuitet</option>
				<option value="serial">Serie</option>
			</select>
		</div>
		<div class="field-group">
			<label>Løpetid (år)</label>
			<NumericField
				value={scenario.loanTermYears}
				min={1}
				max={40}
				step={1}
				onchange={(v) => (scenario.loanTermYears = v)}
			/>
		</div>
	</div>

	<div class="row">
		<div class="field-group">
			<label>Rente</label>
			<NumericField
				value={scenario.interestRate}
				isPercent
				min={0}
				max={0.3}
				step={0.001}
				onchange={(v) => (scenario.interestRate = v)}
			/>
		</div>
		<div class="field-group">
			<label>Ekstra/mnd (NOK)</label>
			<NumericField
				value={scenario.extraMonthlyPayment}
				min={0}
				step={500}
				onchange={(v) => (scenario.extraMonthlyPayment = v)}
			/>
		</div>
	</div>

	{#if monthlyPayment}
		<div class="payment-summary">
			{#if monthlyPayment.type === 'annuity'}
				<span class="payment-label">Månedlig terminbeløp</span>
				<span class="payment-value">{nok(monthlyPayment.fixed)}</span>
			{:else}
				<span class="payment-label">Månedlig terminbeløp</span>
				<div class="payment-range">
					<span class="payment-value">{nok(monthlyPayment.first)}</span>
					<span class="payment-arrow">→</span>
					<span class="payment-value payment-last">{nok(monthlyPayment.last)}</span>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Advanced costs -->
	<button class="advanced-toggle" onclick={() => (showAdvanced = !showAdvanced)}>
		{showAdvanced ? '▾' : '▸'} Avanserte kostnader
	</button>

	{#if showAdvanced}
		<div class="subsection">
			<div class="row">
				<div class="field-group">
					<label>Vedlikehold/år</label>
					<NumericField
						value={scenario.annualMaintenancePct}
						isPercent
						min={0}
						max={0.1}
						step={0.001}
						onchange={(v) => (scenario.annualMaintenancePct = v)}
					/>
				</div>
				<div class="field-group">
					<label>Forsikring/år (NOK)</label>
					<NumericField
						value={scenario.annualInsuranceNOK}
						min={0}
						step={500}
						onchange={(v) => (scenario.annualInsuranceNOK = v)}
					/>
				</div>
			</div>
		</div>
	{/if}

	<InvestmentFields investment={scenario.investment} />
</div>

<style>
	.form {
		display: flex;
		flex-direction: column;
		gap: 10px;
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

	.section-title {
		color: var(--text-dim);
		font-size: 10px;
		letter-spacing: 0.1em;
		margin-top: 4px;
		text-transform: uppercase;
	}

	.toggle-row {
		align-items: center;
		color: var(--text-muted);
		cursor: pointer;
		display: flex;
		font-size: 12px;
		gap: 8px;
		letter-spacing: 0;
		margin-bottom: 0;
		text-transform: none;
	}

	.toggle-row input[type='checkbox'] {
		accent-color: var(--accent-amber);
		height: 13px;
		width: 13px;
	}

	.subsection {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 10px;
	}

	.advanced-toggle {
		background: transparent;
		border: none;
		color: var(--text-dim);
		font-size: 11px;
		padding: 0;
		text-align: left;
		transition: color 0.15s;
	}

	.advanced-toggle:hover {
		color: var(--text-muted);
	}

	.payment-summary {
		background: var(--surface);
		border: 1px solid var(--border);
		border-left: 2px solid var(--accent-amber);
		border-radius: var(--radius);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		padding: 7px 10px;
	}

	.payment-label {
		color: var(--text-dim);
		font-size: 10px;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.payment-range {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.payment-value {
		color: var(--accent-amber);
		font-size: 12px;
	}

	.payment-last {
		color: var(--text-muted);
	}

	.payment-arrow {
		color: var(--text-dim);
		font-size: 10px;
	}
</style>
