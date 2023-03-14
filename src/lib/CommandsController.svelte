<script lang="ts">
	import { savedGrid } from './stores';
	import Command from './Command.svelte';
</script>

<Command
	title="Set up the starting values on the board"
	label="_I_nitialise board"
	command="initialise"
	on:command
/>

<Command
	title="Highlight conflicting cells in rows, columns and boxes"
	label="_H_ighlight conflicts"
	command="highlight-conflicts"
	on:command
/>

<Command
	title="Save the current state of the board. Saved data WILL be lost if you refresh the browser window"
	label="Sa_v_e"
	command="save"
	on:command
/>

<Command
	title="Restore the previously saved state of the board"
	label="Rest_o_re"
	command="restore"
	disabled={$savedGrid.length === 0}
	on:command
/>

<Command
	title="Restart the puzzle, retaining initial puzzle setup"
	label="_R_estart"
	command="restart"
	on:command
/>

<Command
	title="Clear all data on the board"
	label="Clear _b_oard"
	command="clear-board"
	on:command
/>
