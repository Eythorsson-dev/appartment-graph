import LZString from 'lz-string';
import type { AppState, RentScenario, BuyScenario } from './types';

const COLORS = [
	'#F59E0B', // amber
	'#6EE7B7', // sage
	'#FCA5A5', // clay rose
	'#93C5FD', // slate blue
	'#D8B4FE', // lavender
	'#FDE68A'  // pale gold
];

let colorIndex = 0;
export function nextColor(): string {
	return COLORS[colorIndex++ % COLORS.length];
}

export function defaultRentScenario(): RentScenario {
	return {
		id: crypto.randomUUID(),
		type: 'rent',
		name: 'Rent + Invest',
		color: nextColor(),
		monthlyRent: 15000,
		annualRentIncrease: 0.035,
		investment: {
			monthlyContribution: 5000,
			annualReturn: 0.07,
			useASK: true
		}
	};
}

export function defaultBuyScenario(): BuyScenario {
	return {
		id: crypto.randomUUID(),
		type: 'buy',
		name: 'Buy a House',
		color: nextColor(),
		listingPrice: 4_000_000,
		propertyType: 'selveier',
		annualAppreciation: 0.045,
		fellesgjeld: 0,
		fellesgjeldInterestRate: 0.045,
		fellesgjeldRemainingYears: 20,
		felleskostnaderMonthly: 0,
		downPayment: 400_000,
		loanType: 'annuity',
		interestRate: 0.055,
		loanTermYears: 25,
		extraMonthlyPayment: 0,
		annualMaintenancePct: 0.01,
		annualInsuranceNOK: 7500,
		investment: {
			monthlyContribution: 0,
			annualReturn: 0.07,
			useASK: true
		}
	};
}

const DEFAULT_STATE: AppState = {
	global: {
		timeHorizonYears: 25,
		inflationRate: 0.025,
		taxRate: 0.22,
		startingCapital: 500_000
	},
	scenarios: [defaultRentScenario(), defaultBuyScenario()]
};

function serialize(state: AppState): string {
	return LZString.compressToEncodedURIComponent(JSON.stringify(state));
}

function deserialize(raw: string): AppState | null {
	try {
		const json = LZString.decompressFromEncodedURIComponent(raw);
		return json ? JSON.parse(json) : null;
	} catch {
		return null;
	}
}

function readFromHash(): AppState | null {
	if (typeof window === 'undefined') return null;
	const hash = window.location.hash.slice(1);
	const params = new URLSearchParams(hash);
	const raw = params.get('state');
	return raw ? deserialize(raw) : null;
}

function writeToHash(state: AppState): void {
	if (typeof window === 'undefined') return;
	const params = new URLSearchParams();
	params.set('state', serialize(state));
	history.replaceState(null, '', '#' + params.toString());
}

function deepClone<T>(v: T): T {
	return JSON.parse(JSON.stringify(v));
}

export const appState = $state<AppState>(readFromHash() ?? deepClone(DEFAULT_STATE));

export function initUrlSync(): () => void {
	const cleanup = $effect.root(() => {
		$effect(() => {
			writeToHash(JSON.parse(JSON.stringify(appState)));
		});
	});

	const onNav = () => {
		const fromUrl = readFromHash();
		if (fromUrl) {
			appState.global = fromUrl.global;
			appState.scenarios = fromUrl.scenarios;
		}
	};
	window.addEventListener('popstate', onNav);
	window.addEventListener('hashchange', onNav);

	return () => {
		cleanup();
		window.removeEventListener('popstate', onNav);
		window.removeEventListener('hashchange', onNav);
	};
}

export function addScenario(type: 'rent' | 'buy'): void {
	const s = type === 'rent' ? defaultRentScenario() : defaultBuyScenario();
	s.name = type === 'rent' ? `Rent + Invest ${appState.scenarios.length + 1}` : `Buy ${appState.scenarios.length + 1}`;
	appState.scenarios.push(s);
}

export function removeScenario(id: string): void {
	const idx = appState.scenarios.findIndex((s) => s.id === id);
	if (idx !== -1) appState.scenarios.splice(idx, 1);
}

export function duplicateScenario(id: string): void {
	const idx = appState.scenarios.findIndex((s) => s.id === id);
	if (idx === -1) return;
	const clone = deepClone(appState.scenarios[idx]);
	clone.id = crypto.randomUUID();
	clone.name = clone.name + ' (copy)';
	clone.color = nextColor();
	appState.scenarios.splice(idx + 1, 0, clone);
}
