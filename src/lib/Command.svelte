<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import { registerCommand } from './utils';

	export let title = '';
	export let label = '';
	export let disabled = false;
	export let command = '';

	// Find the shortcut key - character between two underscores
	const shortcut = registerCommand(label, command);

	const dispatch = createEventDispatcher();

	function handleClick() {
		console.log('Dispatching command', command);
		dispatch('command', { command });
	}
</script>

<button {title} {disabled} on:click={handleClick}>
	{shortcut.pre}<span class="shortcut">{shortcut.shortcut}</span>{shortcut.post}
</button>

<style>
	button {
		background-color: white;
		padding: 0.3rem 0.6rem;
		border: 1px solid var(--primary-colour-lighter);
		border-radius: 0.2rem;
	}

	button:not([disabled]):hover {
		background-color: var(--primary-colour);
		color: white;
		cursor: pointer;
	}

	button[disabled] {
		opacity: 0.5;
		cursor: default;
	}
</style>
