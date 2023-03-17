<script lang="ts">
	import { Mode } from './types';
	import Choice from './Choice.svelte';
	import Group from './Group.svelte';
	import Command from './Command.svelte';

	export let mode: Mode;
</script>

<Group>
	<Choice
		name="mode"
		title="Use this mode to add your (partial) solution to the board"
		label="<i class='bi bi-pen'></i>"
		choice={Mode.EnterValue}
		bind:value={mode}
		command="enter-value"
		on:command
	/>

	<Choice
		name="mode"
		title="Use this mode to pencil in possible values in each cell"
		label="<i class='bi bi-123'></i>"
		choice={Mode.PencilIn}
		bind:value={mode}
		command="pencil-in"
		on:command
	/>
</Group>

<Group>
	<Command
		title="Lock pencil marks in selected cells"
		label="<i class='bi bi-lock'></i>"
		command="fix-pencil-marks"
		on:command
	/>
</Group>
