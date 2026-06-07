<script lang="ts">
	import { appState, addScenario, removeScenario, duplicateScenario } from '$lib/state.svelte';
	import GlobalSettings from './GlobalSettings.svelte';
	import RentScenarioForm from './RentScenarioForm.svelte';
	import BuyScenarioForm from './BuyScenarioForm.svelte';
	import type { RentScenario, BuyScenario, Scenario } from '$lib/types';

	let expandedIds: Set<string> = $state(new Set(appState.scenarios.map((s) => s.id)));

	function toggleExpanded(id: string) {
		if (expandedIds.has(id)) {
			expandedIds.delete(id);
		} else {
			expandedIds.add(id);
		}
		expandedIds = new Set(expandedIds);
	}

	const nok = (v: number) =>
		new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(v);

	function calcMonthlyCost(scenario: Scenario): { housing: number; total: number; label: string } {
		if (scenario.type === 'rent') {
			const s = scenario as RentScenario;
			return {
				housing: s.monthlyRent,
				total: s.monthlyRent + s.investment.monthlyContribution,
				label: 'Husleie + investering'
			};
		}

		const s = scenario as BuyScenario;
		const principal = Math.max(0, s.listingPrice - s.downPayment);
		const r = s.interestRate / 12;
		const n = s.loanTermYears * 12;

		let mortgagePayment = 0;
		if (principal > 0 && n > 0) {
			if (s.loanType === 'annuity') {
				mortgagePayment = r === 0 ? principal / n : (principal * r) / (1 - Math.pow(1 + r, -n));
			} else {
				// Serial: first month payment
				mortgagePayment = principal / n + principal * r;
			}
		}
		mortgagePayment += s.extraMonthlyPayment;

		// Tax saving on first month's interest
		const firstInterest = principal * r;
		const fellesgjeldInterest = s.fellesgjeld > 0 ? (s.fellesgjeld * s.fellesgjeldInterestRate) / 12 : 0;
		const taxSaving = (firstInterest + fellesgjeldInterest) * 0.22;

		const maintenance = (s.listingPrice * s.annualMaintenancePct) / 12;
		const insurance = s.annualInsuranceNOK / 12;

		const housing = mortgagePayment + s.felleskostnaderMonthly + maintenance + insurance - taxSaving;
		const total = housing + s.investment.monthlyContribution;

		return {
			housing,
			total,
			label: s.loanType === 'serial' ? 'Første mnd (synkende)' : 'Fast per mnd'
		};
	}
</script>

<div class="panel">
	<GlobalSettings />

	<div class="scenarios-header">
		<span class="label-text">Scenarioer</span>
		<div class="add-buttons">
			<button class="add-btn" onclick={() => addScenario('rent')}>+ Leie</button>
			<button class="add-btn" onclick={() => addScenario('buy')}>+ Kjøpe</button>
		</div>
	</div>

	<div class="scenario-list">
		{#each appState.scenarios as scenario (scenario.id)}
			{@const monthly = calcMonthlyCost(scenario)}
			<div class="scenario-card">
				<div class="scenario-header" onclick={() => toggleExpanded(scenario.id)} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && toggleExpanded(scenario.id)}>
					<div class="scenario-title">
						<span class="color-dot" style="background:{scenario.color}"></span>
						<div class="title-stack">
							<div class="title-row">
								<span class="scenario-type-badge" class:rent={scenario.type === 'rent'} class:buy={scenario.type === 'buy'}>
									{scenario.type === 'rent' ? 'LEIE' : 'KJØPE'}
								</span>
								<input
									class="name-input"
									type="text"
									value={scenario.name}
									onclick={(e) => e.stopPropagation()}
									oninput={(e) => { scenario.name = (e.target as HTMLInputElement).value; }}
								/>
							</div>
							<div class="monthly-row">
								<span class="monthly-amount">{nok(monthly.housing)}</span>
								<span class="monthly-sep">/mnd</span>
								{#if scenario.investment.monthlyContribution > 0}
									<span class="monthly-invest">+ {nok(scenario.investment.monthlyContribution)} invest.</span>
								{/if}
								{#if scenario.type === 'buy' && (scenario as BuyScenario).loanType === 'serial'}
									<span class="monthly-note">↓</span>
								{/if}
							</div>
						</div>
					</div>
					<div class="scenario-actions">
						<button class="icon-btn" title="Dupliser" onclick={(e) => { e.stopPropagation(); duplicateScenario(scenario.id); }}>⧉</button>
						<button class="icon-btn danger" title="Slett" onclick={(e) => { e.stopPropagation(); removeScenario(scenario.id); }}>✕</button>
						<span class="chevron" class:open={expandedIds.has(scenario.id)}>›</span>
					</div>
				</div>

				{#if expandedIds.has(scenario.id)}
					<div class="scenario-body">
						{#if scenario.type === 'rent'}
							<RentScenarioForm scenario={scenario as RentScenario} />
						{:else}
							<BuyScenarioForm scenario={scenario as BuyScenario} />
						{/if}
					</div>
				{/if}
			</div>
		{/each}

		{#if appState.scenarios.length === 0}
			<div class="empty-state">
				<p>Ingen scenarioer ennå.</p>
				<p>Legg til et leie- eller kjøpescenario ovenfor.</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.panel {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.scenarios-header {
		align-items: center;
		border-bottom: 1px solid var(--border);
		display: flex;
		justify-content: space-between;
		padding: 10px 14px;
	}

	.label-text {
		color: var(--text-muted);
		font-size: 11px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.add-buttons {
		display: flex;
		gap: 6px;
	}

	.add-btn {
		background: transparent;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		color: var(--text-muted);
		font-size: 11px;
		padding: 4px 10px;
		transition: all 0.15s;
	}

	.add-btn:hover {
		border-color: var(--accent-amber);
		color: var(--accent-amber);
	}

	.scenario-list {
		flex: 1;
		overflow-y: auto;
	}

	.scenario-card {
		border-bottom: 1px solid var(--border);
	}

	.scenario-header {
		align-items: center;
		cursor: pointer;
		display: flex;
		justify-content: space-between;
		padding: 10px 14px;
		user-select: none;
	}

	.scenario-header:hover {
		background: var(--surface);
	}

	.scenario-title {
		align-items: center;
		display: flex;
		gap: 8px;
		flex: 1;
		min-width: 0;
	}

	.color-dot {
		border-radius: 50%;
		flex-shrink: 0;
		height: 8px;
		width: 8px;
	}

	.title-stack {
		display: flex;
		flex-direction: column;
		gap: 3px;
		min-width: 0;
		flex: 1;
	}

	.title-row {
		align-items: center;
		display: flex;
		gap: 6px;
	}

	.scenario-type-badge {
		border-radius: 2px;
		font-size: 9px;
		font-weight: 500;
		letter-spacing: 0.08em;
		padding: 2px 5px;
		flex-shrink: 0;
	}

	.scenario-type-badge.rent {
		background: #6ee7b720;
		color: var(--accent-sage);
	}

	.scenario-type-badge.buy {
		background: #f59e0b20;
		color: var(--accent-amber);
	}

	.name-input {
		background: transparent;
		border: none;
		color: var(--text);
		font-size: 12px;
		min-width: 0;
		padding: 0;
		width: 100%;
	}

	.name-input:focus {
		background: var(--surface-2);
		border-radius: 2px;
		outline: none;
		padding: 0 4px;
	}

	.monthly-row {
		align-items: baseline;
		display: flex;
		gap: 4px;
	}

	.monthly-amount {
		color: var(--text);
		font-size: 13px;
	}

	.monthly-sep {
		color: var(--text-dim);
		font-size: 10px;
	}

	.monthly-invest {
		color: var(--text-dim);
		font-size: 10px;
	}

	.monthly-note {
		color: var(--text-dim);
		font-size: 10px;
		title: 'Serielån: synkende terminbeløp';
	}

	.scenario-actions {
		align-items: center;
		display: flex;
		gap: 4px;
		flex-shrink: 0;
	}

	.icon-btn {
		background: transparent;
		border: none;
		border-radius: var(--radius);
		color: var(--text-dim);
		font-size: 13px;
		line-height: 1;
		padding: 3px 5px;
		transition: all 0.15s;
	}

	.icon-btn:hover {
		background: var(--surface-2);
		color: var(--text);
	}

	.icon-btn.danger:hover {
		color: #f87171;
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

	.scenario-body {
		border-top: 1px solid var(--border);
		padding: 12px 14px;
	}

	.empty-state {
		color: var(--text-dim);
		padding: 32px 20px;
		text-align: center;
	}

	.empty-state p {
		margin-bottom: 4px;
	}
</style>
