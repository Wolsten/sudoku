<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { SelectMode } from './types';
	import Group from './Group.svelte';
	import Choice from './Choice.svelte';
	import Toggle from './Toggle.svelte';

	export let selectMode: SelectMode;
	export let crosshair: boolean;

	const dispatch = createEventDispatcher();
</script>

<Group>
	<Choice
		name="selectMode"
		title="Only allow single cell selections"
		label="<i class='bi bi-check2'></i>"
		command="select-mode-single"
		option={SelectMode.Single}
		value={selectMode}
		on:command
	/>

	<Choice
		name="selectMode"
		title="Allow multiple cell selections and value entry plus pencil marks"
		label="<i class='bi bi-check2-all'></i>"
		command="select-mode-multiple"
		option={SelectMode.Multiple}
		value={selectMode}
		on:command
	/>

	<Choice
		name="selectMode"
		title="Clear selections"
		label="<i class='bi bi-eraser'></i>"
		command="select-mode-clear"
		option={SelectMode.Clear}
		value={selectMode}
		on:command
	/>
</Group>

<Toggle
	title="Show crosshairs for single selections"
	label="<i class='bi bi-dpad'></i>"
	command={'toggle-crosshairs'}
	bind:value={crosshair}
	on:command
/>

<Group>
	{#each [1, 2, 3, 4] as index}
		<label
			style="background-color:var(--background-colour-{index});"
			title="Toggle this colour in selected cell(s)"
		>
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
