<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { SelectMode } from './types';
	import Group from './Group.svelte';
	import Choice from './Choice.svelte';
	import Command from './Command.svelte';

	export let selectMode: SelectMode;

	const dispatch = createEventDispatcher();
</script>

<Group>
	<Choice
		name="selectMode"
		title="Only allow single cell selections"
		label="_S_ingle"
		command="select-mode-single"
		choice={SelectMode.Single}
		bind:value={selectMode}
		on:command
	/>

	<Choice
		name="selectMode"
		title="Allow multiple cell selections and value entry plus pencil marks"
		label="_M_ultiple"
		command="select-mode-multiple"
		choice={SelectMode.Multiple}
		bind:value={selectMode}
		on:command
	/>
</Group>

<Group>
	<Command
		title="Clear selections"
		label="_C_lear"
		command="select-mode-clear"
		on:command={(event) => {
			dispatch('command', { command: event.detail.command });
			selectMode = SelectMode.Single;
		}}
	/>
</Group>

<Group>
	{#each [1, 2, 3, 4] as index}
		<label style="background-color:var(--background-colour-{index});">
			&nbsp;
			<input type="button" on:click={() => dispatch('command', { command: 'colour-' + index })} />
		</label>
	{/each}
</Group>

<style>
	/* Hide the browser's default radio button */
	input {
		position: absolute;
		opacity: 0;
		cursor: pointer;
		height: 0;
		width: 0;
		margin: 0;
	}

	label {
		width: 30px;
		height: 30px;
		border: 1px solid transparent;
		cursor: pointer;
	}

	label:first-child {
		border-top-left-radius: var(--border-radius);
		border-bottom-left-radius: var(--border-radius);
	}

	label:last-child {
		border-top-right-radius: var(--border-radius);
		border-bottom-right-radius: var(--border-radius);
	}
</style>
