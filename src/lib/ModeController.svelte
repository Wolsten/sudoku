<script lang="ts">
	import { Mode } from './types';
	import Choice from './Choice.svelte';
	import Group from './Group.svelte';
	import Toggle from './Toggle.svelte';

	export let mode: Mode;
	export let locked: boolean;
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

<Group>
	<Toggle
		title="Lock pencil marks in selected cells"
		label="<i class='bi bi-lock'></i>"
		command="fix-pencil-marks"
		value={locked}
		on:command
	/>
</Group>
