<script lang="ts">
	import Controls from './Controls.svelte';
	import Board from './Board.svelte';

	import { Mode, SelectMode } from './types';

	let mode: Mode = Mode.EnterValue;
	let selectMode: SelectMode = SelectMode.Single;
	let command = '';

	function handleCommand(event: any) {
		command = event.detail.shortcut;
	}
</script>

<Board bind:mode bind:selectMode {command} />

<Controls bind:mode bind:selectMode on:command={handleCommand} />
