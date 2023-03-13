<script lang="ts">
	import { Mode } from './types';
	import Choice from './Choice.svelte';
	import Group from './Group.svelte';

	export let mode: Mode;
</script>

<Group>
	<Choice
		name="mode"
		title="Use this mode to set up the starting values on the board"
		label="_I_nitialise"
		choice={Mode.Initialise}
		command="initialise"
		bind:value={mode}
		on:command
	/>

	<Choice
		name="mode"
		title="Use this mode to add your (partial) solution to the board"
		label="_E_nter value"
		choice={Mode.EnterValue}
		bind:value={mode}
		command="enter-value"
		on:command
	/>

	<Choice
		name="mode"
		title="Use this mode to pencil in possible values in each cell"
		label="_P_encil in"
		choice={Mode.PencilIn}
		bind:value={mode}
		command="pencil-in"
		on:command
	/>
</Group>
