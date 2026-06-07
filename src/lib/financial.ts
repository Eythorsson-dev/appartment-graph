import type { RentScenario, BuyScenario, GlobalSettings, YearlyDataPoint, ScenarioResult, Scenario } from './types';

// --- Loan schedule ---

function buildLoanSchedule(
	principal: number,
	annualRate: number,
	months: number,
	loanType: 'annuity' | 'serial',
	extraMonthly = 0
): Array<{ interest: number; principal: number; balance: number }> {
	if (principal <= 0 || months <= 0) return [];
	const r = annualRate / 12;
	let balance = principal;

	const fixedPayment =
		loanType === 'annuity'
			? r === 0
				? principal / months
				: (principal * r) / (1 - Math.pow(1 + r, -months))
			: 0;
	const fixedPrincipal = loanType === 'serial' ? principal / months : 0;

	return Array.from({ length: months }, () => {
		if (balance <= 0) return { interest: 0, principal: 0, balance: 0 };
		const interest = balance * r;
		const principalPayment =
			loanType === 'annuity'
				? Math.min(Math.max(0, fixedPayment - interest + extraMonthly), balance)
				: Math.min(fixedPrincipal + extraMonthly, balance);
		balance = Math.max(0, balance - principalPayment);
		return { interest, principal: principalPayment, balance };
	});
}

// --- Portfolio math ---

function portfolioAfterTax(finalValue: number, totalInvested: number, useASK: boolean, taxRate: number): number {
	if (!useASK) return finalValue;
	const gains = Math.max(0, finalValue - totalInvested);
	return finalValue - gains * taxRate;
}

// --- Rent scenario ---

export function calcRentScenario(scenario: RentScenario, global: GlobalSettings): ScenarioResult {
	const months = global.timeHorizonYears * 12;
	const { annualReturn, monthlyContribution, useASK } = scenario.investment;

	let portfolio = global.startingCapital;
	let totalInvested = global.startingCapital;
	const dataPoints: YearlyDataPoint[] = [];

	for (let m = 0; m < months; m++) {
		portfolio = portfolio * (1 + annualReturn / 12) + monthlyContribution;
		totalInvested += monthlyContribution;

		if ((m + 1) % 12 === 0) {
			const netPortfolio = portfolioAfterTax(portfolio, totalInvested, useASK, global.taxRate);
			dataPoints.push({
				year: (m + 1) / 12,
				netWorth: netPortfolio,
				portfolioValue: netPortfolio
			});
		}
	}

	return { scenario, dataPoints };
}

// --- Buy scenario ---

export function calcBuyScenario(scenario: BuyScenario, global: GlobalSettings): ScenarioResult {
	const months = global.timeHorizonYears * 12;
	const { annualReturn, monthlyContribution, useASK } = scenario.investment;

	const personalMortgage = Math.max(0, scenario.listingPrice - scenario.downPayment);
	const remainingCapital = Math.max(0, global.startingCapital - scenario.downPayment);

	// Dokumentavgift reduces investable capital upfront (opportunity cost)
	const dokumentavgift = scenario.propertyType === 'selveier' ? scenario.listingPrice * 0.025 : 0;
	let portfolio = Math.max(0, remainingCapital - dokumentavgift);
	let totalInvested = portfolio;

	const mortgageMonths = scenario.loanTermYears * 12;
	const mortgageSchedule = buildLoanSchedule(
		personalMortgage,
		scenario.interestRate,
		mortgageMonths,
		scenario.loanType,
		scenario.extraMonthlyPayment
	);

	const fellesgjeldMonths = scenario.fellesgjeld > 0 ? scenario.fellesgjeldRemainingYears * 12 : 0;
	const fellesgjeldSchedule =
		fellesgjeldMonths > 0
			? buildLoanSchedule(scenario.fellesgjeld, scenario.fellesgjeldInterestRate, fellesgjeldMonths, 'serial')
			: [];

	let propertyValue = scenario.listingPrice;
	const dataPoints: YearlyDataPoint[] = [];

	for (let m = 0; m < months; m++) {
		if (m > 0 && m % 12 === 0) {
			propertyValue *= 1 + scenario.annualAppreciation;
		}

		portfolio = portfolio * (1 + annualReturn / 12) + monthlyContribution;
		totalInvested += monthlyContribution;

		if ((m + 1) % 12 === 0) {
			const year = (m + 1) / 12;
			const mortgageBalance = m < mortgageSchedule.length ? mortgageSchedule[m].balance : 0;
			const fellesgjeldBalance = m < fellesgjeldSchedule.length ? fellesgjeldSchedule[m].balance : 0;
			const homeEquity = propertyValue - mortgageBalance - fellesgjeldBalance;
			const agentCommission = propertyValue * 0.02;
			const liquidHomeEquity = Math.max(0, homeEquity - agentCommission);
			const netPortfolio = portfolioAfterTax(portfolio, totalInvested, useASK, global.taxRate);

			dataPoints.push({
				year,
				netWorth: liquidHomeEquity + netPortfolio,
				portfolioValue: netPortfolio,
				propertyValue,
				personalMortgageRemaining: mortgageBalance,
				fellesgjeldRemaining: fellesgjeldBalance,
				homeEquity: liquidHomeEquity
			});
		}
	}

	return { scenario, dataPoints };
}

export function calcScenario(scenario: Scenario, global: GlobalSettings): ScenarioResult {
	if (scenario.type === 'rent') return calcRentScenario(scenario, global);
	return calcBuyScenario(scenario, global);
}
