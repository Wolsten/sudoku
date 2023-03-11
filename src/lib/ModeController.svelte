<script lang="ts">
	import { Mode } from './types';
	import Choice from './Choice.svelte';
	import Group from './Group.svelte';

	export let mode: Mode;

	$: console.log('ModeController: mode changed to', mode);

	function handleKeydown(event: KeyboardEvent) {
		const key = event.key;
		console.log('ModeController: detected key', key);
		switch (key) {
			case 'i':
				mode = mode === Mode.Initialise ? Mode.EnterValue : Mode.Initialise;
				break;
			case 'e':
				mode = Mode.EnterValue;
				break;
			case 'p':
				mode = Mode.PencilIn;
				break;
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<Group>
	<Choice
		name="mode"
		title="Use this mode to set up the starting values on the board"
		label="_I_nitialise"
		choice={Mode.Initialise}
		bind:value={mode}
	/>

	<Choice
		name="mode"
		title="Use this mode to add your (partial) solution to the board"
		label="_E_nter value"
		choice={Mode.EnterValue}
		bind:value={mode}
	/>

	<Choice
		name="mode"
		title="Use this mode to pencil in possible values in each cell"
		label="_P_encil in"
		choice={Mode.PencilIn}
		bind:value={mode}
	/>
</Group>
