<script lang="ts">
	import { savedGrid } from './stores';
	import MenuItem from './MenuItem.svelte';

	export let show = false;
</script>

<div class="commands-menu" class:show>
	<MenuItem
		title="Set up the starting values on the board"
		label="Initialise board"
		command="initialise"
		on:command
	/>

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
		disabled={$savedGrid.length === 0}
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

	<MenuItem title="Close this menu" label="Close" command="close-menu" on:command />
</div>

<style>
	.commands-menu {
		display: none;
		position: fixed;
		width: 100%;
		top: 0;
		left: 0;
	}

	.show {
		display: flex;
		flex-direction: column;
	}
</style>
