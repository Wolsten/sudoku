<script lang="ts">
	import { Mode } from './types';
	import Choice from './Choice.svelte';
	import Group from './Group.svelte';
	import Keypad from './Keypad.svelte';
	import Command from './Command.svelte';

	export let mode: Mode;
</script>

<div class="column">
	<Group>
		<!-- <Choice
			name="mode"
			title="Use this mode to set up the starting values on the board"
			label="_I_nitialise"
			choice={Mode.Initialise}
			command="initialise"
			bind:value={mode}
			on:command
			on:number
		/> -->

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

	<div class="row">
		<Command
			title="Lock pencil marks in selected cells"
			label="_F_ix pencil marks"
			command="fix-pencil-marks"
			on:command
		/>

		<Command title="Commands menu" label="Men_u_" command="commands-menu" on:command />
	</div>
</div>

<Group>
	<Keypad on:number />
</Group>

<style>
	.column {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
