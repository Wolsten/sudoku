<script lang="ts">
	import Controls from './Controls.svelte';
	import Board from './Board.svelte';

	import { Mode, SelectMode } from './types';
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
			show = !show;
		} else {
			show = false;
			setCommand(command);
		}
	}

	function handleNumber(event: any) {
		let number = event.detail.number;
		setNumber(number);
	}

	function handleKeydown(event: KeyboardEvent) {
		event.preventDefault();
		// console.log('key', event.key);
		const number: number = Number(event.key);
		if (isNaN(number)) {
			setCommand(event.key);
		} else {
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
				label="<i class='bi bi-list'></i>"
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
	@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.3/font/bootstrap-icons.css');

	.container {
		/* Variables */
		--primary-colour: rgb(84, 79, 97);
		--primary-colour-lighter: rgb(187, 198, 214);
		--select-colour: rgb(240, 240, 240);

		--font-colour: rgb(82, 80, 85);
		--font-colour-light: rgb(125, 123, 123);
		--font-colour-initial: rgb(245, 240, 240);
		--font-colour-error: red;

		--background-colour-1: rgb(247, 156, 156);
		--background-colour-2: rgb(126, 185, 121);
		--background-colour-3: rgb(171, 169, 234);
		--background-colour-4: rgb(67, 203, 224);

		--border-radius: 0.3rem;

		color: var(--font-colour);

		position: relative;

		padding: 0 10%;
	}

	:global(.container *) {
		box-sizing: border-box;
		font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode',
			Geneva, Verdana, sans-serif;
	}

	h1 {
		display: flex;
		justify-content: space-around;
		align-items: center;
	}

	@media (max-width: 580px) {
		.container {
			padding: 0 0.1rem;
		}
		h1 {
			font-size: 1.4rem;
		}
	}
</style>
