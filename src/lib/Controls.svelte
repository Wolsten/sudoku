<script lang="ts">
	import type { Mode, SelectMode } from './types';

	import ModeController from './ModeController.svelte';
	import Keypad from './Keypad.svelte';
	import SelectModeController from './SelectModeController.svelte';

	export let mode: Mode;
	export let selectMode: SelectMode;

	// $: console.log('Controls:mode', mode);
</script>

<div class="container">
	<div class="controls mode" title="Values">
		<ModeController {mode} on:command />
	</div>

	<Keypad on:number />

	<div class="controls select" title="Selections">
		<SelectModeController {selectMode} on:command />
	</div>
</div>

<style>
	.container {
		display: flex;
		justify-content: space-around;
	}

	.controls {
		margin-top: 1rem;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		justify-content: space-between;
		border: 1px solid var(--primary-colour);
		border-radius: 0.3rem;
		padding: 1rem 0.5rem 0.5rem 0.5rem;
		margin: 0.5rem 3%;
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
