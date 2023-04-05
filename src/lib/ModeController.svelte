<script lang="ts">
	import { Mode } from './types';
	import Choice from './Choice.svelte';
	import Group from './Group.svelte';
	import Toggle from './Toggle.svelte';
	import Command from './Command.svelte';

	export let mode: Mode;
	export let locked: boolean;
	export let buffered: boolean;
</script>

<Group>
	<Choice
		name="mode"
		title="Use this mode to add your (partial) solution to the board"
		label="<i class='bi bi-pen'></i>"
		option={Mode.EnterValue}
		value={mode}
		command="enter-value"
		on:command
	/>

	<Choice
		name="mode"
		title="Use this mode to pencil in possible values in each cell"
		label="<i class='bi bi-123'></i>"
		option={Mode.PencilIn}
		value={mode}
		command="pencil-in"
		on:command
	/>
</Group>

<div>
	<Toggle
		title="Lock pencil marks in selected cells"
		label="<i class='bi bi-lock'></i>"
		command="fix-pencil-marks"
		value={locked}
		on:command
	/>

	<Command
		title="Delete all values or options from selected cell(s)"
		label="<i class='bi bi-trash'></i>"
		command="delete"
		on:command
	/>

	<Command
		title="Undo last change"
		label="<i class='bi bi-arrow-counterclockwise'></i>"
		command="undo"
		disabled={!buffered}
		on:command
	/>
</div>

<style>
	div {
		display: flex;
		gap: 0.5rem;
	}
</style>
