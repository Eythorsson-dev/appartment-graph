<script lang="ts">
	import type { RentScenario } from '$lib/types';
	import NumericField from './NumericField.svelte';
	import InvestmentFields from './InvestmentFields.svelte';

	interface Props { scenario: RentScenario; }
	let { scenario }: Props = $props();
</script>

<div class="form">
	<div class="field-group">
		<label>Månedlig husleie (NOK)</label>
		<NumericField
			value={scenario.monthlyRent}
			min={0}
			step={500}
			onchange={(v) => (scenario.monthlyRent = v)}
		/>
	</div>

	<div class="field-group">
		<label>Leieprisvekst per år</label>
		<NumericField
			value={scenario.annualRentIncrease}
			isPercent
			min={0}
			max={0.2}
			step={0.001}
			onchange={(v) => (scenario.annualRentIncrease = v)}
		/>
	</div>

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
</style>
