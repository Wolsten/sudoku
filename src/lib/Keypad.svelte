<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function handleClick(number: number) {
		console.log('clicked number', number);
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
		display: grid;
		grid-template-columns: repeat(3, 1.6rem);
		grid-template-rows: repeat(3, 1.6rem);
		grid-gap: 0.3em;
	}

	button {
		background-color: white;
		padding: 0.3rem 0.6rem;
		border: 1px solid var(--primary-colour-lighter);
		border-radius: 0.2rem;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	button:hover {
		background-color: var(--primary-colour);
		color: white;
		cursor: pointer;
	}
</style>
