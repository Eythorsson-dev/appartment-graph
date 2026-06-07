<script lang="ts">
	interface Props {
		id?: string;
		value: number;
		isPercent?: boolean;
		min?: number;
		max?: number;
		step?: number;
		onchange: (v: number) => void;
	}

	let { id, value, isPercent = false, min, max, step, onchange }: Props = $props();

	const displayMin = $derived(isPercent && min !== undefined ? min * 100 : min);
	const displayMax = $derived(isPercent && max !== undefined ? max * 100 : max);
	const displayStep = $derived(isPercent && step !== undefined ? step * 100 : step);

	function toDisplay(v: number): string {
		if (isPercent) return (v * 100).toFixed(2);
		return String(Math.round(v));
	}

	function fromDisplay(raw: string): number {
		const n = parseFloat(raw);
		if (isNaN(n)) return value;
		return isPercent ? n / 100 : n;
	}

	let displayValue = $state(toDisplay(value));

	$effect(() => {
		displayValue = toDisplay(value);
	});

	function handleChange(e: Event) {
		const v = fromDisplay((e.target as HTMLInputElement).value);
		onchange(v);
	}
</script>

<div class="field">
	<input
		{id}
		type="number"
		value={displayValue}
		min={displayMin}
		max={displayMax}
		step={displayStep}
		onchange={handleChange}
	/>
	{#if isPercent}
		<span class="unit">%</span>
	{/if}
</div>

<style>
	.field {
		position: relative;
	}

	.unit {
		color: var(--text-dim);
		font-size: 12px;
		pointer-events: none;
		position: absolute;
		right: 8px;
		top: 50%;
		transform: translateY(-50%);
	}

	input {
		padding-right: 24px;
	}
</style>
