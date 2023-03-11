<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let title = '';
	export let label = '';
	export let disabled = false;

	// Find the shortcut key - character between two underscores
	const match = label.match(/.?_(.?)_.?/gm);
	console.log('label', label, 'match', match);
	const shortcut = match ? match[1].toLowerCase() : 'UNKNOWN';

	const dispatch = createEventDispatcher();

	label = label.replace('_', '<span class="shortcut">').replace('_', '</span>');

	function handleClick() {
		console.log('Dispatching command', shortcut);
		dispatch('command', { shortcut });
	}
</script>

<button {title} {disabled} on:click={handleClick}>
	{@html label}
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
	}

	button[disabled] {
		opacity: 0.5;
		cursor: default;
	}
</style>
