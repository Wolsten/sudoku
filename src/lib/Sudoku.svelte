<script lang="ts">
	import Controls from './Controls.svelte';
	import Board from './Board.svelte';

	import { Mode, SelectMode } from './types';
	import { shortcuts } from './utils';

	let mode: Mode = Mode.EnterValue;
	let selectMode: SelectMode = SelectMode.Single;
	let number = 0;
	let set: any;

	function handleCommand(event: any) {
		let command = event.detail.command;
		console.log('Sudoku: handling command', command);
		set(command);
	}

	function handleKeydown(event: KeyboardEvent) {
		event.preventDefault();
		console.log('shortcuts', shortcuts);

		const num: number = Number(event.key);

		if (isNaN(num)) {
			if (shortcuts.has(event.key)) {
				const command = shortcuts.get(event.key);
				console.log('Sudoku: handling shortcut', command);
				set(command);
			}
		} else {
			console.log('Number', num);
			number = num;
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<Board {mode} {selectMode} {number} bind:set />

<Controls {mode} {selectMode} on:command={handleCommand} />

<style>
	:global(:root) {
		/* Variables */
		--primary-colour: rgb(84, 79, 97);
		--primary-colour-lighter: rgb(187, 198, 214);
		--select-colour: rgb(240, 240, 240);

		--font-colour: rgb(82, 80, 85);
		--font-colour-light: rgb(125, 123, 123);
		--font-colour-initial: rgb(245, 240, 240);
		--font-colour-error: red;

		--background-colour-1: rgb(220, 127, 127);
		--background-colour-2: rgb(163, 212, 159);
		--background-colour-3: rgb(152, 149, 245);
		--background-colour-4: rgb(241, 244, 90);

		--border-radius: 0.3rem;

		color: var(--font-colour);
	}

	:global(body) {
		width: 90vw;
		margin: 0;
	}

	:global(body *) {
		box-sizing: border-box;
		font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode',
			Geneva, Verdana, sans-serif;
	}
</style>
