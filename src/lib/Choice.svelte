<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	export let name = '';
	export let title = '';
	export let label = '';
	export let value = 0;
	export let choice = 0;
	export let command = '';

	const dispatch = createEventDispatcher();
</script>

<label {title} class:active={value === choice}>
	<span>{@html label}</span>
	<input
		type="radio"
		{name}
		bind:group={value}
		value={choice}
		on:click={() => dispatch('command', { command })}
	/>
</label>

<style>
	/* Customize the label (the container) */
	label {
		font-size: 0.9rem;
		display: flex;
		flex-direction: row-reverse;
		align-items: center;
		gap: 0.3rem;

		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;

		padding: 0.1rem 0.3rem;
		font-size: 1.2rem;

		border-top: 1px solid var(--primary-colour-lighter);
		border-bottom: 1px solid var(--primary-colour-lighter);
		border-left: 1px solid var(--primary-colour-lighter);
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

	label:first-child {
		border-top-left-radius: var(--border-radius);
		border-bottom-left-radius: var(--border-radius);
	}

	label:last-child {
		border-right: 1px solid var(--primary-colour-lighter);
		border-top-right-radius: var(--border-radius);
		border-bottom-right-radius: var(--border-radius);
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
