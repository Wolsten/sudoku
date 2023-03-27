<script lang="ts">
	// import { createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';
	import Command from './Command.svelte';

	export let help: boolean;

	// const dispatch = createEventDispatcher();
</script>

{#if help}
	<div class="container" transition:fly={{ x: -600, duration: 500 }}>
		<h2>
			Help <div class="close">
				<Command
					title="Return to the board"
					label="<i class='bi bi-x-lg'></i>"
					command="close-help"
					on:command
				/>
			</div>
		</h2>

		<p>
			This Sudoku Board provides features that make it easier to solve more complicated Sudoku
			problems. For example, to pencil in possible values and lock them when you have narrowed down
			the available options. Also, to highlight cells in different colours to help implement logical
			solution strategies, such as X-wings.
		</p>

		<p>
			First set up the initial Sudoku puzzle by selecting <strong>Initialise board</strong> from the
			drop-down menu <i class="bi bi-list" />. Enter the starting values and then click
			<strong>Solve puzzle</strong>
			from the drop-down menu or close the initialisation dialogue and then click the
			<i class="bi bi-pen" />
			icon at the bottom left of the window. Alternatively, click the
			<strong>Load Sudoku board image</strong>
			button to load an image (jpeg or png) of a Sudoku puzzle. This must be tightly cropped in a square
			with the same number of rows and columns as the board.
		</p>

		<p>
			In Pen mode <i class="bi bi-pen" />, enter solution values by selecting cell(s) and then
			clicking a keypad number. To pencil in options for a cell, change to Pencil mode
			<i class="bi bi-123" />. If you are using a desktop computer you can enter values directly
			from your keyboard as well as navigate around the board using arrow keys. Click the Lock
			<i class="bi bi-lock" />
			button to toggle locking of options where you have narrowed down the possible values. On a desktop
			computer use the
			<strong>l</strong> key shortcut to toggle locking on a cell or cells.
		</p>

		<p>
			Use the colour selector to highlight selected cell or cells with the 1 to 4 colours. Like
			entered numbers, colours toggle off those already present. You can also highlight all solution
			values set to a particular number by double clicking the number anywhere on the board.
		</p>

		<p>
			To spot conflicting values in a row, column or box, select <strong>Highlight conflicts</strong
			>
			from the drop-down menu. At any stage you may save the current state of the board by clicking
			<strong>Save</strong>
			on the drop-down menu and subsequently, restore it by clicking <strong>Restore</strong>.
		</p>
	</div>
{/if}

<style>
	.container {
		padding: 1rem;
		position: absolute;
		top: 0;
		left: 0;
		background-color: white;
	}

	p {
		font-size: 1rem;
		line-height: 1.6rem;
	}

	i {
		border: 1px solid var(--primary-colour-lighter);
		padding: 0.2rem;
		border-radius: var(--border-radius);
		color: var(--primary-colour);
	}

	h2 {
		color: var(--primary-colour);
		display: flex;
		justify-content: space-between;
	}
</style>
