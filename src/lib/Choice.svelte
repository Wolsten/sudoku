<script lang="ts">
	export let name = '';
	export let title = '';
	export let label = '';
	export let value = 0;
	export let choice = 0;

	const shortcut = label.replace('_', '<span class="shortcut">').replace('_', '</span>');
</script>

<label {title} class:active={value === choice}>
	<span>{@html shortcut}</span>
	<input type="radio" {name} bind:group={value} value={choice} />
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

		padding: 0.3rem 0.5rem;
		border-top: 1px solid var(--primary-colour-lighter);
		border-bottom: 1px solid var(--primary-colour-lighter);
		border-left: 1px solid var(--primary-colour-lighter);

		--border-radius: 0.3rem;
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

	.group label:first-child {
		border-top-left-radius: var(--border-radius);
		border-bottom-left-radius: var(--border-radius);
	}

	.group label:last-child {
		border-right: 1px solid var(--primary-colour-lighter);
		border-top-right-radius: var(--border-radius);
		border-bottom-right-radius: var(--border-radius);
	}

	/* Hide the browser's default radio button */
	label input {
		position: absolute;
		opacity: 0;
		cursor: pointer;
		height: 0;
		width: 0;
		margin: 0;
	}

	.group.colours label {
		border-color: transparent;
		width: 1.4rem;
		height: 1.4rem;
	}
</style>
