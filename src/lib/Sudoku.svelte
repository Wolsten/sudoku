<script lang="ts">
	import { onMount } from 'svelte';

	import Controls from './Controls.svelte';
	import Board from './Board.svelte';

	import { Mode, SelectMode, type Cell, type SelectedCell } from './types';
	import Command from './Command.svelte';
	import Menu from './Menu.svelte';
	import Message from './Message.svelte';
	import Help from './Help.svelte';

	const ROWS = 9;
	const COLS = 9;
	const BOX = 3;

	let imageSrc = '';
	let visible = false;
	let ls: Storage | null;
	let grid: Cell[][] = [];
	let savedGrid: Cell[][] = [];
	let mode: Mode = Mode.Initialise;
	let selectMode: SelectMode = SelectMode.Single;
	let show = false;
	let help = false;
	let selectedCell: SelectedCell;

	// -----------------------------------------------------------------------------
	// @section State handling
	// -----------------------------------------------------------------------------

	initialise();

	onMount(() => {
		setCellHeight();
		typeof localStorage !== `undefined` && (ls = localStorage);
		restoreBoard();
	});

	function setNumber(n: number) {
		if (mode === Mode.Initialise || mode == Mode.EnterValue) {
			setValue(n);
		} else if (mode === Mode.PencilIn) {
			toggleOptions(n);
		}
	}

	function setCommand(command: string) {
		console.log('Board: command=', command);
		switch (command) {
			// Menu
			case 'commands-menu':
				show = !show;
				return;
			case 'close-menu':
				show = false;
				return;

			// Help
			case 'help':
				help = !help;
				break;
			case 'close-help':
				help = false;
				break;

			// Mode
			case 'initialise':
				if (mode === Mode.Initialise) {
					mode = Mode.EnterValue;
				} else {
					mode = Mode.Initialise;
					clearBoard();
				}
				selectMode = SelectMode.Single;
				break;
			case 'enter-value':
				mode = Mode.EnterValue;
				imageSrc = '';
				break;
			case 'pencil-in':
				mode = Mode.PencilIn;
				break;

			// Select mode
			case 'select-mode-single':
				selectMode = SelectMode.Single;
				// clearSelections();
				break;
			case 'select-mode-multiple':
				selectMode = SelectMode.Multiple;
				break;
			case 'select-mode-clear':
				selectMode = SelectMode.Single;
				clearSelections();
				break;
			case 'colour-1':
			case 'colour-2':
			case 'colour-3':
			case 'colour-4':
				handleColour(command);
				break;

			// Navigation
			case 'ArrowLeft':
			case 'ArrowRight':
			case 'ArrowUp':
			case 'ArrowDown':
				if (selectMode === SelectMode.Single) moveSelection(command);
				break;
			case 'Backspace':
				clearSelectedEntries();
				break;

			// Commands
			case 'fix-pencil-marks':
				fixPencilMarks();
				break;
			case 'highlight-conflicts':
				showConflicts();
				break;

			case 'save':
				saveBoard();
				break;
			case 'restore':
				restoreBoard();
				selectMode = SelectMode.Single;
				break;

			case 'restart':
				restart();
				break;
			case 'clear-board':
				clearBoard();
				break;
		}
		show = false;
	}

	function handleCommand(event: any) {
		let command = event.detail.command;
		setCommand(command);
	}

	function handleNumber(event: any) {
		let number = event.detail.number;
		show = false;
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

	function handleImage(event: any) {
		imageSrc = event.detail.imageSrc;
	}

	function loadValues(event: any) {
		const values = event.detail.values;
		clearBoard();
		grid.forEach((row, a) => {
			row.forEach((cell, b) => {
				grid[a][b].value = values[a][b];
				if (grid[a][b].value > 0) {
					grid[a][b].initialised = true;
				}
			});
		});
	}

	// -----------------------------------------------------------------------------
	// @section Functions
	// -----------------------------------------------------------------------------

	function restoreBoard() {
		if (!!ls) {
			const localGrid = ls.getItem('grid') || '';
			if (localGrid !== '') {
				savedGrid = <Cell[][]>JSON.parse(localGrid);
				savedGrid.forEach((row, a) => {
					grid[a] = [];
					row.forEach((cell, b) => {
						grid[a][b] = {
							value: cell.value,
							selected: cell.selected,
							options: [...cell.options],
							colours: [...cell.colours],
							fixed: cell.fixed,
							initialised: cell.initialised,
							error: cell.error
						};
					});
				});
			}
			mode = Mode.EnterValue;
		}
	}

	function saveBoard() {
		if (!!ls) {
			savedGrid = [...grid];
			const localGrid = JSON.stringify(grid);
			ls.setItem('grid', localGrid);
		}
	}

	function initialise() {
		for (let row = 0; row < ROWS; row++) {
			grid[row] = [];
			for (let col = 0; col < COLS; col++) {
				grid[row][col] = {
					value: 0,
					selected: false,
					options: [],
					colours: [],
					fixed: false,
					initialised: false,
					error: false
				};
			}
		}
	}

	function setCellHeight() {
		const width = grid[0][0].dom?.clientWidth;
		console.log('setting cell heights to ', width);
		grid.forEach((row) => {
			row.forEach((cell) => {
				if (cell.dom) {
					cell.dom.style.height = width + 'px';
				}
			});
		});

		visible = true;
	}

	function clearSelections() {
		grid.forEach((row, a) => {
			row.forEach((cell, b) => {
				grid[a][b].colours = [];
				grid[a][b].selected = false;
			});
		});
	}

	function fixPencilMarks() {
		grid.forEach((row, a) => {
			row.forEach((cell, b) => {
				if (cell.selected) {
					grid[a][b].fixed = !cell.fixed;
				}
			});
		});
	}

	function clearSelectedEntries() {
		grid.forEach((row, a) => {
			row.forEach((cell, b) => {
				if (cell.selected && cell.initialised === false) {
					grid[a][b].value = 0;
					grid[a][b].options = [];
					grid[a][b].colours = [];
					grid[a][b].fixed = false;
				}
			});
		});
	}

	function clearBoard() {
		grid.forEach((row, a) => {
			row.forEach((cell, b) => {
				grid[a][b].value = 0;
				grid[a][b].selected = false;
				grid[a][b].options = [];
				grid[a][b].colours = [];
				grid[a][b].fixed = false;
				grid[a][b].initialised = false;
				grid[a][b].error = false;
			});
		});
	}

	function clearErrors() {
		grid.forEach((row, a) => {
			row.forEach((cell, b) => {
				grid[a][b].error = false;
			});
		});
	}

	function showConflicts() {
		clearErrors();
		// Rows
		for (let row = 0; row < ROWS; row++) {
			for (let col1 = 0; col1 < COLS; col1++) {
				for (let col2 = 0; col2 < COLS; col2++) {
					if (
						grid[row][col1].error === false &&
						grid[row][col1].value !== 0 &&
						col1 !== col2 &&
						grid[row][col1].value === grid[row][col2].value
					) {
						// console.log('found column mistake in cell', row, col1);
						grid[row][col1].error = true;
					}
				}
			}
		}
		// Columns
		for (let col = 0; col < COLS; col++) {
			for (let row1 = 0; row1 < ROWS; row1++) {
				for (let row2 = 0; row2 < ROWS; row2++) {
					if (
						grid[row1][col].error === false &&
						grid[row1][col].value !== 0 &&
						row1 !== row2 &&
						grid[row1][col].value === grid[row2][col].value
					) {
						console.log('found column mistake in cell', row1, col);
						grid[row1][col].error = true;
					}
				}
			}
		}
		// Boxes
		for (let row = 0; row < ROWS; row += BOX) {
			for (let col = 0; col < COLS; col += BOX) {
				for (let boxRow1 = row; boxRow1 < row + BOX; boxRow1++) {
					for (let boxRow2 = row; boxRow2 < row + BOX; boxRow2++) {
						for (let boxCol1 = col; boxCol1 < col + BOX; boxCol1++) {
							for (let boxCol2 = col; boxCol2 < col + BOX; boxCol2++) {
								if (
									grid[boxRow1][boxCol1].error === false &&
									grid[boxRow1][boxCol1].value !== 0 &&
									boxRow1 !== boxRow2 &&
									boxCol1 !== boxCol2 &&
									grid[boxRow1][boxCol1].value === grid[boxRow2][boxCol2].value
								) {
									console.log('found column mistake in box', boxRow1, boxCol1);
									grid[boxRow1][boxCol1].error = true;
								}
							}
						}
					}
				}
			}
		}
	}

	function toggleOptions(num: number) {
		grid.forEach((row, a) => {
			row.forEach((cell, b) => {
				if (cell.selected && cell.value === 0) {
					let list = cell.options;
					if (num === 0) {
						list = [];
					} else if (list.includes(num)) {
						list = list.filter((option) => option !== num);
					} else {
						list.push(num);
					}
					grid[a][b].options = [...list];
				}
			});
		});
	}

	function setValue(num: number) {
		console.log('setting value');
		grid.forEach((row, a) => {
			row.forEach((cell, b) => {
				if (cell.selected) {
					if (grid[a][b].value === num || num === 0) {
						grid[a][b].value = 0;
						if (mode === Mode.Initialise) {
							grid[a][b].initialised = false;
						}
					} else {
						grid[a][b].value = num;
						if (mode === Mode.Initialise) {
							grid[a][b].initialised = true;
						}
					}
				}
			});
		});
	}

	function moveSelection(key: string) {
		if (selectedCell.row !== -1 && selectedCell.col !== -1) {
			grid[selectedCell.row][selectedCell.col].selected = false;
		}
		switch (key) {
			case 'ArrowRight':
				selectedCell.col++;
				if (selectedCell.col === COLS) {
					selectedCell.col = 0;
				}
				break;
			case 'ArrowLeft':
				selectedCell.col--;
				if (selectedCell.col === -1) {
					selectedCell.col = COLS - 1;
				}
				break;
			case 'ArrowDown':
				selectedCell.row++;
				if (selectedCell.row === ROWS) {
					selectedCell.row = 0;
				}
				break;
			case 'ArrowUp':
				selectedCell.row--;
				if (selectedCell.row === -1) {
					selectedCell.row = ROWS - 1;
				}
				break;
		}
		grid[selectedCell.row][selectedCell.col].selected = true;
	}

	function restart() {
		grid.forEach((row, a) => {
			row.forEach((cell, b) => {
				grid[a][b].selected = false;
				if (cell.initialised === false) {
					grid[a][b].value = 0;
					grid[a][b].options = [];
					grid[a][b].fixed = false;
				}
			});
		});
	}

	function handleColour(colour: string) {
		const index = parseInt(colour.split('-')[1]);
		console.log('new colour', index);
		grid.forEach((row, a) => {
			row.forEach((cell, b) => {
				if (cell.selected) {
					let colours = cell.colours;
					if (colours.includes(index)) {
						colours = colours.filter((c) => c !== index);
					} else {
						colours.push(index);
					}
					grid[a][b].colours = [...colours];
				}
			});
		});
	}
</script>

<svelte:window on:keydown={handleKeydown} on:resize={setCellHeight} />

<div class="container" class:visible>
	<h1>
		Sudoku Board

		<div class="menu" class:show>
			<Command
				title="Menu"
				label="<i class='bi bi-list'></i>"
				command="commands-menu"
				on:command={handleCommand}
			/>
		</div>
	</h1>

	{#if help === false}
		<div class="board-container">
			<Board
				{ROWS}
				{COLS}
				{BOX}
				{grid}
				{mode}
				{selectMode}
				{imageSrc}
				on:command={handleCommand}
				bind:selectedCell
			/>

			<Controls {mode} {selectMode} on:command={handleCommand} on:number={handleNumber} />

			<Menu on:command={handleCommand} {show} {mode} restoreDisabled={savedGrid.length === 0} />

			<Message {ROWS} {COLS} {mode} on:image={handleImage} on:load={loadValues} />
		</div>
	{/if}

	<Help {help} on:command={handleCommand} />
</div>

<style>
	@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.3/font/bootstrap-icons.css');

	.container {
		/* Variables */
		--primary-colour: rgb(109, 101, 128);
		--primary-colour-lighter: rgb(209, 217, 230);
		--select-colour: rgb(240, 240, 240);

		--font-colour: rgb(82, 80, 85);
		--font-colour-light: rgb(125, 123, 123);
		--font-colour-initial: rgb(245, 240, 240);
		--font-colour-initialised: rgb(96, 115, 208);
		--font-colour-fixed: rgb(181, 66, 133);
		--font-colour-error: rgb(240, 61, 61);

		--background-colour-1: rgb(247, 156, 156);
		--background-colour-2: rgb(126, 185, 121);
		--background-colour-3: rgb(171, 169, 234);
		--background-colour-4: rgb(67, 203, 224);

		--border-radius: 0.3rem;
		--max-width: 520px;

		color: var(--font-colour);

		position: relative;

		margin: 0 auto;

		max-width: var(--max-width);

		visibility: hidden;
	}

	.container.visible {
		visibility: visible;
	}

	:global(.container *) {
		box-sizing: border-box;
		font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode',
			Geneva, Verdana, sans-serif;
	}

	h1 {
		display: flex;
		justify-content: space-between;
		margin: 1rem;
		color: var(--font-colour-light);
	}

	@media (max-width: 580px) {
		.container {
			padding: 0 0.1rem;
		}
		h1 {
			font-size: 1.4rem;
		}
	}

	.menu {
		transform: rotate(0deg);
		transition: all 500ms;
	}

	.menu.show {
		transform: rotate(-90deg);
	}
</style>
