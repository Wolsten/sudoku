<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let title = '';
	export let label = '';
	export let disabled = false;
	export let command = '';

	const dispatch = createEventDispatcher();

	function handleClick() {
		// console.log('Dispatching command', command);
		dispatch('command', { command });
	}
</script>

<button {title} {disabled} on:click={handleClick}>
	{@html label}
</button>

<style>
	button {
		background-color: white;
		padding: 0.1rem 0.3rem;
		border: 1px solid var(--primary-colour-lighter);
		border-radius: var(--border-radius);
		font-size: 1.6rem;
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
