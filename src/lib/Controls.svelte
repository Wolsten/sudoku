<script lang="ts">
	import type { Mode, SelectMode } from './types';

	import ModeController from './ModeController.svelte';
	import Keypad from './Keypad.svelte';
	import SelectModeController from './SelectModeController.svelte';

	export let mode: Mode;
	export let selectMode: SelectMode;
	export let crosshair: boolean;
	export let locked: boolean;
</script>

<div class="container">
	<div class="controls mode" title="Values">
		<ModeController {locked} {mode} on:command />
	</div>

	<div class="controls select" title="Keypad">
		<Keypad on:number />
	</div>

	<div class="controls select" title="Selections">
		<SelectModeController {selectMode} {crosshair} on:command />
	</div>
</div>

<style>
	.container {
		display: flex;
		justify-content: flex-start;
		align-items: flex-start;
		gap: 1rem;
		padding: 0 1rem;
	}

	.controls {
		margin-top: 1rem;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		justify-content: flex-start;
		align-items: flex-start;
		border: 1px solid var(--primary-colour-lighter);
		border-radius: var(--border-radius);
		padding: 1rem 0.5rem 0.5rem 0.5rem;
		position: relative;
	}

	.controls::before {
		position: absolute;
		top: -0.8rem;
		left: 0.5rem;
		font-size: 0.8rem;
		background: white;
		padding: 0.3rem;
		content: attr(title);
	}
</style>
