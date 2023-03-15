<script lang="ts">
	import Controls from './Controls.svelte';
	import Board from './Board.svelte';

	import { Mode, SelectMode } from './types';
	import { shortcuts } from './utils';
	import Command from './Command.svelte';
	import CommandsController from './CommandsController.svelte';

	let mode: Mode = Mode.EnterValue;
	let selectMode: SelectMode = SelectMode.Single;
	let setCommand: any;
	let setNumber: any;
	let show = false;

	function handleCommand(event: any) {
		let command = event.detail.command;
		if (command === 'initialise') {
			mode = Mode.Initialise;
		}
		if (command === 'commands-menu') {
			show = true;
		} else {
			show = false;
			setCommand(command);
		}
	}

	function handleNumber(event: any) {
		let number = event.detail.number;
		console.log('Number', number);
		setNumber(number);
	}

	function handleKeydown(event: KeyboardEvent) {
		event.preventDefault();
		console.log('key', event.key);
		console.log('shortcuts', shortcuts);

		const number: number = Number(event.key);

		if (isNaN(number)) {
			if (shortcuts.has(event.key)) {
				const command = shortcuts.get(event.key);
				console.log('Sudoku: handling shortcut', command);

				if (command === 'initialise') {
					mode = Mode.Initialise;
				}

				setCommand(command);
			}
		} else {
			console.log('Number', number);
			setNumber(number);
		}

		show = false;
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="container">
	<h1>
		Sudoku Board

		<div class="menu">
			<Command
				title="Commands menu"
				label="Men_u_"
				command="commands-menu"
				on:command={handleCommand}
			/>
		</div>
	</h1>

	<Board {mode} {selectMode} bind:setCommand bind:setNumber />

	<Controls {mode} {selectMode} on:command={handleCommand} on:number={handleNumber} />

	<CommandsController on:command={handleCommand} {show} />
</div>

<style>
	.container {
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

		position: relative;
	}

	:global(.container *) {
		box-sizing: border-box;
		font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode',
			Geneva, Verdana, sans-serif;
	}

	h1 {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
</style>
