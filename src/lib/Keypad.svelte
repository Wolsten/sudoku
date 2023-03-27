<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function handleClick(number: number) {
		dispatch('number', { number });
	}
</script>

<div class="keypad">
	<button on:click={() => handleClick(1)}>1</button>
	<button on:click={() => handleClick(2)}>2</button>
	<button on:click={() => handleClick(3)}>3</button>
	<button on:click={() => handleClick(4)}>4</button>
	<button on:click={() => handleClick(5)}>5</button>
	<button on:click={() => handleClick(6)}>6</button>
	<button on:click={() => handleClick(7)}>7</button>
	<button on:click={() => handleClick(8)}>8</button>
	<button on:click={() => handleClick(9)}>9</button>
</div>

<style>
	.keypad {
		--keypad-size: 2.6rem;
		display: grid;
		grid-template-columns: repeat(3, var(--keypad-size));
		grid-template-rows: repeat(3, var(--keypad-size));
		grid-gap: 0;

		/* margin: 0.5rem; */
	}

	button {
		background-color: white;
		border: 1px solid var(--primary-colour-lighter);
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 1.4rem;
		color: var(--primary-colour);
	}

	button:hover {
		background-color: var(--primary-colour);
		color: white;
		cursor: pointer;
	}
</style>
