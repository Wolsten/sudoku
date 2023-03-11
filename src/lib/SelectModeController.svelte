<script lang="ts">
	import { SelectMode } from './types';
	import Group from './Group.svelte';
	import Choice from './Choice.svelte';
	import Command from './Command.svelte';

	// This value must be bind'd
	export let selectMode: SelectMode = SelectMode.Single;

	function handleKeydown(event: KeyboardEvent) {
		const key = event.key;
		switch (key) {
			case 's':
				selectMode = SelectMode.Single;
				break;
			case 'm':
				selectMode = SelectMode.Multiple;
				break;
			case 'c':
				selectMode = SelectMode.Clear;
				break;
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<Group>
	<Choice
		name="selectMode"
		title="Only allow single cell selections"
		label="_S_ingle"
		choice={SelectMode.Single}
		bind:value={selectMode}
	/>

	<Choice
		name="selectMode"
		title="Allow multiple cell selections and value entry plus pencil marks"
		label="_M_ultiple"
		choice={SelectMode.Multiple}
		bind:value={selectMode}
	/>
</Group>

<Group>
	<Command
		title="Clear selections"
		label="_C_lear"
		on:click={() => (selectMode = SelectMode.Clear)}
	/>
</Group>

<div class="group colours">
	{#each [1, 2, 3, 4] as index}
		<label style="background-color:var(--background-colour-{index});">
			&nbsp;
			<input type="button" on:click={() => dispatch('colour', { colour: index })} />
		</label>
	{/each}
</div>
