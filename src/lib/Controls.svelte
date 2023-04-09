<script lang="ts">
	import type { Mode, SelectMode } from './types';

	import ModeController from './ModeController.svelte';
	import Keypad from './Keypad.svelte';
	import SelectModeController from './SelectModeController.svelte';

	export let mode: Mode;
	export let selectMode: SelectMode;
	export let crosshair: boolean;
	export let locked: boolean;
	export let buffered: boolean;
</script>

<div class="container">
	<div class="controls mode">
		<!-- <h2>Values</h2> -->
		<ModeController {locked} {mode} {buffered} on:command />
	</div>

	<div class="controls select">
		<Keypad on:number />
	</div>

	<div class="controls select">
		<!-- <h2>Selections</h2> -->
		<SelectModeController {selectMode} {crosshair} on:command />
	</div>
</div>

<style>
	.container {
		display: flex;
		justify-content: flex-start;
		align-items: flex-start;
		gap: 0;
	}

	.controls {
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		flex-grow: 0;
		gap: 0.5rem;
		justify-content: space-between;
		align-items: flex-start;

		padding: 1rem 0.5rem 0.5rem 0.5rem;
	}

	.controls:first-child,
	.controls:last-child {
		flex-grow: 2;
	}
</style>
