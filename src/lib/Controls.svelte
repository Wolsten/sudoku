<script lang="ts">
	import type { Mode, SelectMode } from './types';

	import ModeController from './ModeController.svelte';
	import SelectModeController from './SelectModeController.svelte';

	export let mode: Mode;
	export let selectMode: SelectMode;

	$: console.log('Controls:mode', mode);
</script>

<div class="controls mode" title="Values">
	<ModeController {mode} on:command on:number />
</div>

<div class="controls select" title="Selections">
	<SelectModeController {selectMode} on:command />
</div>

<style>
	.controls {
		margin-top: 1rem;
		/* width: 94%; */
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		border: 1px solid var(--primary-colour);
		border-radius: 0.3rem;
		gap: 1rem;
		padding: 1rem;
		margin: 1rem 3%;
		position: relative;
	}

	.controls::after {
		position: absolute;
		top: -0.8rem;
		left: 1rem;
		font-size: 0.8rem;
		background: white;
		padding: 0.3rem;
		content: attr(title);
	}

	:global(.controls .shortcut) {
		display: inline-block;
		border-bottom: 1px solid var(--font-colour);
	}

	:global(.controls label.active .shortcut) {
		border-color: white;
	}

	.controls.commands {
		gap: 1rem;
	}

	.controls .group.colours label {
		border-color: transparent;
		width: 1.4rem;
		height: 1.4rem;
	}
</style>
