<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	export let name = '';
	export let title = '';
	export let label = '';
	export let value = false;
	export let command = '';

	const dispatch = createEventDispatcher();

	function handleClick() {
		dispatch('command', { command });
	}
</script>

<label {title} class:active={value}>
	<span>{@html label}</span>
	<input type="checkbox" {name} checked={value} on:click={handleClick} />
</label>

<style>
	/* Customize the label (the container) */
	label {
		display: flex;
		flex-direction: row-reverse;
		align-items: center;
		gap: 0.3rem;

		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;

		padding: 0.1rem 0.3rem;
		font-size: 1.6rem;

		border: 1px solid var(--primary-colour-lighter);
		border-radius: var(--border-radius);
	}

	label:hover {
		background-color: var(--primary-colour-lighter);
		cursor: pointer;
	}

	label.active {
		background-color: var(--primary-colour);
		border-color: var(--primary-colour);
		cursor: default;
	}

	label.active span {
		color: white;
	}

	/* Hide the browser's default radio button */
	input {
		position: absolute;
		opacity: 0;
		cursor: pointer;
		height: 0;
		width: 0;
		margin: 0;
	}
</style>
