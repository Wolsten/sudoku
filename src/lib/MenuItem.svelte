<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let title = '';
	export let label = '';
	export let disabled = false;
	export let command = '';

	const dispatch = createEventDispatcher();

	function handleClick() {
		console.log('Dispatching command', command);
		dispatch('command', { command });
	}
</script>

<button {title} {disabled} on:click={handleClick}>
	{label}
</button>

<style>
	button {
		background-color: var(--primary-colour);
		color: white;
		font-size: 1.2rem;
		padding: 0.5rem 0.6rem;
		border: 1px solid var(--primary-colour-lighter);
		border-bottom: none;
		width: 100%;
	}

	button:last-child {
		border-bottom: 1px solid var(--primary-colour-lighter);
	}

	button:not([disabled]):hover {
		background-color: var(--primary-colour-lighter);
		color: var(--font-colour);
		cursor: pointer;
	}

	button[disabled] {
		color: var(--font-colour-light);
		cursor: default;
	}
</style>
