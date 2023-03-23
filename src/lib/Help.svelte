<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';
	import Command from './Command.svelte';

	export let help: boolean;

	const dispatch = createEventDispatcher();
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
			drop-down menu <strong><i class="bi bi-list" /></strong>. Enter the starting values and then
			click <strong>Solve puzzle</strong> from the drop-down menu or close the initialisation
			dialogue and then click the <strong><i class="bi bi-pen" /></strong> icon in the
			<strong>Values</strong> panel. Alternatively, click the
			<strong>Load Sudoku board image</strong>
			button to load an image of a Sudoku puzzle. This must be tightly cropped in a square with the same
			number of rows and columns as the board. When finished, click the
			<strong><i class="bi bi-pen" /></strong> icon below to begin solving.
		</p>

		<p>
			In <strong>Pen mode <i class="bi bi-pen" /></strong>, enter solution values by selecting
			cell(s) and then clicking a keypad number. To pencil in options for a cell, change to
			<strong>Pencil mode <i class="bi bi-123" /></strong>. If you are using a desktop computer you
			can enter values directly from your keyboard as well as navigate around the board using arrow
			keys. Click the <strong>Lock <i class="bi bi-lock" /></strong> button to toggle locking of
			options where you have narrowed down the possible values. On a desktop computer use the
			<strong>l</strong> key shortcut to toggle locking on a cell or cells.
		</p>

		<p>
			Or, and easier, load an image (jpeg or png) of a Sudoku puzzle which must be tightly cropped
			in a square with the same number of rows and columns as the board above. As above, click the <i
				class="bi bi-pen"
			/> icon above to begin solving. There will be a short delay the first time you use this feature.
		</p>
		<p>
			Enter values or options in one or more cells, depending which selection mode is active, <strong
				><i class="bi bi-check2" /></strong
			>
			or <strong><i class="bi bi-check2-all" /></strong>. Any entries will toggle the those already
			set for the selected cell(s). To clear a selected cell or cells, enter a zero, toggle the
			value or (if on a desktop computer) select the <strong>Backspace</strong> key. On a desktop computer
			you can also use the Shift key to toggle selection modes.
		</p>

		<p>
			Use the colour selector to highlight selected cell or cells with the 1 to 4 colours. Like
			entered numbers, colours toggle off those already present.
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
	}

	h2 {
		display: flex;
		justify-content: space-between;
	}
</style>
