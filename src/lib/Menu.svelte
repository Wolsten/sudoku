<script lang="ts">
	import { fly } from 'svelte/transition';

	import { Mode } from './types';
	import MenuItem from './MenuItem.svelte';

	export let show = false;
	export let mode: Mode;
	export let restoreDisabled = true;

	let title = '';
	let label = '';

	$: if (mode === Mode.Initialise) {
		title = 'Finish initialisation and solve the puzzle';
		label = 'Solve the puzzle';
	} else {
		title = 'Set up the starting values on the board';
		label = 'Initialise board';
	}
</script>

{#if show}
	<div class="show-menu" transition:fly={{ y: -600, duration: 500 }}>
		<MenuItem title="Generate random puzzle" label="Random puzzle" command="random" on:command />

		<MenuItem {title} {label} command="initialise" on:command />

		<MenuItem
			title="Highlight conflicting cells in rows, columns and boxes"
			label="Highlight conflicts"
			command="highlight-conflicts"
			on:command
		/>

		<MenuItem
			title="Save the current state of the board. Saved data WILL be lost if you refresh the browser window"
			label="Save"
			command="save"
			on:command
		/>

		<MenuItem
			title="Restore the previously saved state of the board"
			label="Restore"
			command="restore"
			disabled={restoreDisabled}
			on:command
		/>

		<MenuItem
			title="Restart the puzzle, retaining initial puzzle setup"
			label="Restart"
			command="restart"
			on:command
		/>

		<MenuItem
			title="Clear all data on the board"
			label="Clear board"
			command="clear-board"
			on:command
		/>

		<MenuItem title="Show user guide" label="Help" command="help" on:command />

		<MenuItem title="Close this menu" label="Close" command="close-menu" on:command />
	</div>
{/if}

<style>
	.show-menu {
		display: flex;
		flex-direction: column;
		position: absolute;
		width: 250px;
		top: -1rem;
		left: 0rem;
		box-shadow: var(--shadow);
	}
</style>
