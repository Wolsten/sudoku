<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import { savedGrid } from './stores';
	import Command from './Command.svelte';

	const dispatch = createEventDispatcher();

	function handleKeydown(event: KeyboardEvent) {
		const key = event.key;
		dispatch('command', { shortcut: key });
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<Command title="Lock pencil marks in selected cells" label="_F_ix pencil marks" on:click />

<Command
	title="Highlight conflicting cells in rows, columns and boxes"
	label="_H_ighlight conflicts"
	on:command
/>

<Command
	title="Save the current state of the board. Saved data WILL be lost if you refresh the browser window"
	label="Sa_v_e"
	on:command
/>

<Command
	title="Restore the previously saved state of the board"
	label="Rest_o_re"
	disabled={$savedGrid.length === 0}
	on:command
/>

<Command title="Restart the puzzle, retaining initial puzzle setup" label="_R_estart" on:command />

<Command title="Clear all data on the board" label="_b_oard" on:command />
