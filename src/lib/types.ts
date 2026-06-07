export type LoanType = 'annuity' | 'serial';
export type PropertyType = 'selveier' | 'borettslag';
export type ScenarioType = 'rent' | 'buy';

export interface GlobalSettings {
	timeHorizonYears: number;
	inflationRate: number;
	taxRate: number;
	startingCapital: number;
}

export interface InvestmentSettings {
	monthlyContribution: number;
	annualReturn: number;
	useASK: boolean;
}

export interface RentScenario {
	id: string;
	type: 'rent';
	name: string;
	color: string;
	monthlyRent: number;
	annualRentIncrease: number;
	investment: InvestmentSettings;
}

export interface BuyScenario {
	id: string;
	type: 'buy';
	name: string;
	color: string;
	// Property
	listingPrice: number;
	propertyType: PropertyType;
	annualAppreciation: number;
	// Fellesgjeld (borettslag)
	fellesgjeld: number;
	fellesgjeldInterestRate: number;
	fellesgjeldRemainingYears: number;
	felleskostnaderMonthly: number;
	// Personal loan
	downPayment: number;
	loanType: LoanType;
	interestRate: number;
	loanTermYears: number;
	extraMonthlyPayment: number;
	// Ongoing costs
	annualMaintenancePct: number;
	annualInsuranceNOK: number;
	// Investment alongside
	investment: InvestmentSettings;
}

export type Scenario = RentScenario | BuyScenario;

export interface AppState {
	global: GlobalSettings;
	scenarios: Scenario[];
}

export interface YearlyDataPoint {
	year: number;
	netWorth: number;
	// Components
	portfolioValue: number;
	// Buy only
	propertyValue?: number;
	personalMortgageRemaining?: number;
	fellesgjeldRemaining?: number;
	homeEquity?: number;
}

export interface ScenarioResult {
	scenario: Scenario;
	dataPoints: YearlyDataPoint[];
}
