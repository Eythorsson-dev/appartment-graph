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

	let focused = $state(false);

	function formatDisplay(v: number): string {
		if (isPercent) return (v * 100).toFixed(2);
		return new Intl.NumberFormat('nb-NO').format(Math.round(v));
	}

	function formatEdit(v: number): string {
		if (isPercent) return (v * 100).toFixed(2);
		return String(Math.round(v));
	}

	function parse(raw: string): number {
		// Strip Norwegian thousand-separator spaces before parsing
		const cleaned = raw.replace(/\s/g, '').replace(',', '.');
		const n = parseFloat(cleaned);
		if (isNaN(n)) return value;
		return isPercent ? n / 100 : n;
	}

	let inputEl: HTMLInputElement;

	function handleFocus() {
		focused = true;
		// Switch to raw editable value
		inputEl.value = formatEdit(value);
		inputEl.select();
	}

	function handleBlur(e: FocusEvent) {
		focused = false;
		const v = parse((e.target as HTMLInputElement).value);
		onchange(v);
		inputEl.value = formatDisplay(v);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
	}

	$effect(() => {
		if (!focused && inputEl) {
			inputEl.value = formatDisplay(value);
		}
	});
</script>

<div class="field">
	<input
		{id}
		bind:this={inputEl}
		type="text"
		inputmode="decimal"
		value={formatDisplay(value)}
		onfocus={handleFocus}
		onblur={handleBlur}
		onkeydown={handleKeydown}
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
