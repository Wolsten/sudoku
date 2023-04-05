<script lang="ts">
	// https://www.sudokuwiki.org/Sudoku_Creation_and_Grading.pdf
	import { onMount } from 'svelte';

	import Controls from './Controls.svelte';
	import Board from './Board.svelte';

	import { Mode, SelectMode, type Cell, type SelectedCell } from './types';
	import Command from './Command.svelte';
	import Menu from './Menu.svelte';
	import Initialisation from './Initialisation.svelte';
	import Help from './Help.svelte';

	const ROWS = 9;
	const COLS = 9;
	const BOX = 3;
	const BUFFER_SIZE = 5;

	const MAX_ITERATIONS_SETTING = 200000;
	const MAX_ITERATIONS_SOLVING = 200000;
	const NUMBER_OF_GIVEN_CELLS = 28;
	const MAX_ATTEMPTS_TO_SOLVE = 30;

	let ls: Storage | null;
	let grid: Cell[][] = [];
	let savedGrid: Cell[][] = [];
	let bufferGrid: Cell[][][] = [];
	let mode: Mode = Mode.Initialise;
	let selectMode: SelectMode = SelectMode.Single;
	let showMenu = false;
	let help = false;
	let selectedCell: SelectedCell;
	let crosshair = false;
	let locked = false;
	let showInit = false;
	let solutions: string[] = [];

	// -----------------------------------------------------------------------------
	// @section State handling
	// -----------------------------------------------------------------------------

	initialise();

	onMount(() => {
		typeof localStorage !== `undefined` && (ls = localStorage);
		restoreBoard();
	});

	function setNumber(n: number) {
		if (mode === Mode.Initialise || mode == Mode.EnterValue) {
			setValue(n);
		} else if (mode === Mode.PencilIn) {
			toggleOptions(n);
		}
		if (mode !== Mode.Initialise) {
			updateBuffer();
		}
	}

	// When clearing selections need a delay before resetting the selection mode
	$: if (selectMode === SelectMode.Clear) {
		setTimeout(() => (selectMode = SelectMode.Single), 500);
	}

	function setCommand(command: string) {
		// console.log('Board: command=', command);
		switch (command) {
			// Menu
			case 'show-menu':
				showMenu = !showMenu;
				return;
			case 'close-menu':
				showMenu = false;
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
					showInit = false;
				} else {
					showInit = true;
					mode = Mode.Initialise;
					clearBoard();
					console.log('showInit', showInit);
				}
				selectMode = SelectMode.Single;
				break;
			case 'enter-value':
				mode = Mode.EnterValue;
				showInit = false;
				break;
			case 'pencil-in':
				mode = Mode.PencilIn;
				showInit = false;
				break;
			case 'close-init':
				mode = Mode.EnterValue;
				showInit = false;
				break;

			// Select mode
			case 'select-mode-single':
				selectMode = SelectMode.Single;
				clearSelections();
				break;
			case 'Shift':
				if (selectMode === SelectMode.Single) {
					selectMode = SelectMode.Multiple;
				} else {
					clearSelections();
					selectMode = SelectMode.Single;
				}

				break;
			case 'select-mode-multiple':
				selectMode = SelectMode.Multiple;
				// clearSelections();
				break;
			case 'select-mode-clear':
				selectMode = SelectMode.Clear;
				clearSelections();
				break;
			case 'colour-1':
			case 'colour-2':
			case 'colour-3':
			case 'colour-4':
				handleColour(command);
				break;
			case 'toggle-crosshairs':
				crosshair = !crosshair;
				clearSelections();
				break;
			case 'cell-locked':
				locked = true;
				break;
			case 'cell-unlocked':
				locked = false;
				break;

			// Navigation
			case 'ArrowLeft':
			case 'ArrowRight':
			case 'ArrowUp':
			case 'ArrowDown':
				if (selectMode === SelectMode.Single) {
					moveSelection(command);
				}
				break;

			// Commands
			case 'l':
			case 'fix-pencil-marks':
				toggleLockedPencilMarks();
				break;
			case 'Backspace':
			case 'delete':
				deleteSelectedEntries();
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
			case 'undo':
				retrieveBuffer();
				break;

			case 'restart':
				restart();
				break;
			case 'clear-board':
				clearBoard();
				break;
			case 'r':
			case 'random':
				findUniqueSolution();
				showInit = false;
				mode = Mode.EnterValue;
				break;
		}
		showMenu = false;
	}

	function handleCommand(event: any) {
		let command = event.detail.command;
		setCommand(command);
	}

	function handleNumber(event: any) {
		let number = event.detail.number;
		showMenu = false;
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
		showMenu = false;
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
		updateBuffer();
	}

	// -----------------------------------------------------------------------------
	// @section Functions
	// -----------------------------------------------------------------------------

	function updateBuffer() {
		// Create copy
		const newEntry = structuredClone(grid);
		bufferGrid = [...bufferGrid, newEntry];
		if (bufferGrid.length > BUFFER_SIZE) {
			bufferGrid = bufferGrid.slice(1);
		}
	}

	function retrieveBuffer() {
		if (bufferGrid.length > 1) {
			// Create shallow copy of all bar last value
			bufferGrid = bufferGrid.slice(0, bufferGrid.length - 1);
			grid = bufferGrid[bufferGrid.length - 1];
		}
	}

	function getRandomInt(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function getRandomIntFromArray(possible: number[]): number {
		const i = getRandomInt(0, possible.length - 1);
		return possible[i];
	}

	function generateRandomSolution(setting = true): boolean {
		const MAX_CELLS = ROWS * COLS;
		let attempts = 0;
		let finishedBoard = false;
		let n = 0;
		let possible: number[][] = [];
		let backtracking = false;
		let maxAttempts = setting ? MAX_ITERATIONS_SETTING : MAX_ITERATIONS_SOLVING;

		while (!finishedBoard) {
			let row = Math.floor(n / ROWS);
			let col = n - row * ROWS;
			let finishedCell = false;
			// console.log(n, row, col);

			if (backtracking) {
				// Check if initialised and if so backtrack further
				if (grid[row][col].initialised) {
					n--;
					finishedCell = true;
				} else {
					// Remove the value from possibles and reset the cell
					possible[n] = possible[n].filter((item) => item !== grid[row][col].value);
					grid[row][col].value = 0;

					// If run out of options backtrack further
					if (possible[n].length === 0) {
						n--;
						finishedCell = true;
					}
				}
			} else {
				if (grid[row][col].initialised) {
					n++;
					finishedCell = true;
					if (n >= MAX_CELLS) {
						console.log('Number of attempts =', attempts);
						finishedBoard = true;
					}
				} else {
					// Initialise the full set of possible values
					possible[n] = [];
					for (let i: number = 1; i <= COLS; i++) {
						possible[n].push(i);
					}
				}
			}

			while (!finishedCell) {
				attempts++;
				if (attempts > maxAttempts) {
					console.log(
						'Number of attempts exceeded maximum attempts =',
						attempts,
						'at cell',
						row,
						col
					);
					return false;
				}

				const value = getRandomIntFromArray(possible[n]);

				// console.log('trying', attempts, possible[n], value);
				// if (grid[row][col].initialised) {
				// 	possible[n] = possible[n].filter((item) => item !== grid[row][col].value);
				// 	finishedCell = true;
				// 	backtracking = false;
				// 	n++;
				// } else {
				grid[row][col].value = value;

				if (showConflicts(true)) {
					// Remove last value from the possible list
					possible[n] = possible[n].filter((item) => item !== value);

					// If run out then backtrack
					if (possible[n].length === 0) {
						// Set this cell to 0 and flag exit this inner loop
						// and also to flag backtracking
						grid[row][col].value = 0;
						finishedCell = true;
						backtracking = true;

						// Check not going too far back
						if (n > 0) {
							n--;
							row = Math.floor(n / ROWS);
							col = n - row * ROWS;

							// Run out of options
						} else {
							console.log('Run out of options, number of attempts =', attempts);
							return false;
						}
					}

					// No conflicts - go onto the next cell
				} else {
					finishedCell = true;
					backtracking = false;
					n++;

					// Finish if hit the last cell
					if (n === MAX_CELLS) {
						console.log('Number of attempts =', attempts);
						finishedBoard = true;
						return true;
					}
				}
				// }
			}
		}

		return false;
	}

	function printSolution(index: number) {
		if (index !== -1) {
			solutions[index] = '';
		}
		grid.forEach((row) => {
			let output = '';
			row.forEach((col) => (output = output + '  ' + col.value));
			console.log(output);
			if (index !== -1) {
				solutions[index] += output;
			}
		});
	}

	function solutionMatchesPuzzle(): boolean {
		return solutions[0] === solutions[1];
	}

	function findUniqueSolution() {
		let i = 0;
		let found = false;
		while (i < MAX_ATTEMPTS_TO_SOLVE && found === false) {
			found = generateRandomPuzzle();
			i++;
		}
		if (found) {
			restart();
		}
	}

	function generateRandomPuzzle(): boolean {
		clearBoard();
		solutions = [];
		console.warn('Generating solution');
		if (generateRandomSolution(true)) {
			printSolution(0);
			console.log('Generating puzzle');

			for (let i = 0; i < COLS * ROWS - NUMBER_OF_GIVEN_CELLS; i++) {
				let done = false;
				while (!done) {
					const n = getRandomInt(0, COLS * ROWS - 1);
					const row = Math.floor(n / ROWS);
					const col = n - row * ROWS;
					if (grid[row][col].value > 0) {
						grid[row][col].value = 0;
						done = true;
					}
				}
			}
			for (let i = 0; i < COLS * ROWS; i++) {
				const row = Math.floor(i / ROWS);
				const col = i - row * ROWS;
				if (grid[row][col].value > 0) {
					grid[row][col].initialised = true;
				}
			}
		}

		printSolution(-1);

		console.log('Testing solution');
		if (generateRandomSolution(false)) {
			printSolution(1);
			if (solutionMatchesPuzzle()) {
				console.log('Great, solution matches puzzle');
				return true;
			} else {
				console.warn('Oops, solution does not match puzzle');
			}
		} else {
			console.error('Could not find solution');
		}
		clearBoard();
		return false;
	}

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
							selected: false,
							options: [...cell.options],
							colours: [...cell.colours],
							locked: cell?.locked || false,
							initialised: cell?.initialised || false,
							error: cell?.error || false,
							crosshair: false
						};
					});
				});
			}
			mode = Mode.EnterValue;
			bufferGrid = [];
			updateBuffer();
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
					locked: false,
					initialised: false,
					error: false,
					crosshair: false
				};
			}
		}
	}

	function clearSelections() {
		grid.forEach((row, a) => {
			row.forEach((cell, b) => {
				grid[a][b].colours = [];
				grid[a][b].selected = false;
				grid[a][b].crosshair = false;
			});
		});
	}

	function toggleLockedPencilMarks() {
		grid.forEach((row, a) => {
			row.forEach((cell, b) => {
				if (cell.selected) {
					grid[a][b].locked = !cell.locked;
					locked = grid[a][b].locked;
				}
			});
		});
	}

	// function clearSelectedEntries() {
	// 	grid.forEach((row, a) => {
	// 		row.forEach((cell, b) => {
	// 			if (cell.selected && cell.initialised === false) {
	// 				grid[a][b].value = 0;
	// 				grid[a][b].options = [];
	// 				grid[a][b].colours = [];
	// 				grid[a][b].locked = false;
	// 			}
	// 		});
	// 	});
	// }

	function deleteSelectedEntries() {
		grid.forEach((row, a) => {
			row.forEach((cell, b) => {
				if (cell.selected && cell.initialised === false) {
					if (mode === Mode.EnterValue) {
						grid[a][b].value = 0;
					} else if (mode === Mode.PencilIn) {
						grid[a][b].options = [];
						grid[a][b].colours = [];
						grid[a][b].locked = false;
					}
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
				grid[a][b].locked = false;
				grid[a][b].initialised = false;
				grid[a][b].error = false;
				grid[a][b].crosshair = false;
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

	function findRowConflicts(stopOnError: boolean = false): boolean {
		let error = false;
		for (let row = 0; row < ROWS; row++) {
			for (let col1 = 0; col1 < COLS; col1++) {
				for (let col2 = 0; col2 < COLS; col2++) {
					if (
						grid[row][col1].error === false &&
						grid[row][col1].value !== 0 &&
						col1 !== col2 &&
						grid[row][col1].value === grid[row][col2].value
					) {
						error = true;
						if (stopOnError) {
							return true;
						} else {
							grid[row][col1].error = true;
						}
					}
				}
			}
		}
		return error;
	}

	function findColConflicts(stopOnError: boolean = false): boolean {
		let error = false;
		for (let col = 0; col < COLS; col++) {
			for (let row1 = 0; row1 < ROWS; row1++) {
				for (let row2 = 0; row2 < ROWS; row2++) {
					if (
						grid[row1][col].error === false &&
						grid[row1][col].value !== 0 &&
						row1 !== row2 &&
						grid[row1][col].value === grid[row2][col].value
					) {
						error = true;
						if (stopOnError) {
							return true;
						} else {
							grid[row1][col].error = true;
						}
					}
				}
			}
		}
		return error;
	}

	function findBoxConflicts(stopOnError: boolean = false): boolean {
		let error = false;
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
									error = true;
									if (stopOnError) {
										return true;
									} else {
										grid[boxRow1][boxCol1].error = true;
									}
								}
							}
						}
					}
				}
			}
		}
		return error;
	}

	function showConflicts(stopOnError = false): boolean {
		clearErrors();
		const error1 = findRowConflicts(stopOnError);
		if (stopOnError && error1) return true;
		const error2 = findColConflicts(stopOnError);
		if (stopOnError && error2) return true;
		const error3 = findBoxConflicts(stopOnError);
		if (stopOnError && error3) return true;
		return error1 || error2 || error3;
	}

	function toggleOptions(num: number) {
		grid.forEach((row, a) => {
			row.forEach((cell, b) => {
				if (cell.selected && cell.locked === false && cell.value === 0) {
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
		// console.log('setting value');
		grid.forEach((row, a) => {
			row.forEach((cell, b) => {
				// if (a === 8 && b === 7) console.log('checking cell', cell);
				if (cell.selected) {
					// console.log('setting value for cell', cell);

					if (grid[a][b].value === num || num === 0) {
						if (mode === Mode.Initialise) {
							grid[a][b].value = 0;
							grid[a][b].initialised = false;
						} else if (cell.initialised === false) {
							grid[a][b].value = 0;
						}
					} else {
						if (mode === Mode.Initialise) {
							grid[a][b].value = num;
							grid[a][b].initialised = true;
						} else if (cell.initialised === false) {
							grid[a][b].value = num;
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
		locked = grid[selectedCell.row][selectedCell.col].locked;
	}

	function restart() {
		grid.forEach((row, a) => {
			row.forEach((cell, b) => {
				grid[a][b].selected = false;
				if (cell.initialised === false) {
					grid[a][b].value = 0;
					grid[a][b].options = [];
					grid[a][b].locked = false;
				}
			});
		});
	}

	function handleColour(colour: string) {
		const index = parseInt(colour.split('-')[1]);
		// console.log('new colour', index);
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

<svelte:window on:keydown={handleKeydown} />

<div class="container">
	<h1>
		Sudoku Board

		<div class="menu" class:showMenu>
			<Command
				title="Menu"
				label="<i class='bi bi-list'></i>"
				command="show-menu"
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
				{crosshair}
				on:command={handleCommand}
				bind:selectedCell
			/>

			<Controls
				{mode}
				{selectMode}
				{crosshair}
				{locked}
				buffered={bufferGrid.length > 1}
				on:command={handleCommand}
				on:number={handleNumber}
			/>
		</div>
	{/if}

	<p class="status">
		Mode:
		{#if mode === Mode.Initialise}
			Initialising board
		{:else}
			Solving puzzle
		{/if}
	</p>

	<Menu
		on:command={handleCommand}
		show={showMenu}
		{mode}
		restoreDisabled={savedGrid.length === 0}
	/>

	<Initialisation
		{ROWS}
		{COLS}
		show={showInit}
		{mode}
		on:load={loadValues}
		on:command={handleCommand}
	/>

	<Help {help} on:command={handleCommand} />
</div>

<style>
	@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.3/font/bootstrap-icons.css');

	.container {
		/* Variables */
		--primary-colour: rgb(109, 101, 128);
		--primary-colour-lighter: rgb(230, 236, 246);
		--select-colour: rgb(240, 240, 240);
		--crosshair-colour: rgba(230, 236, 246, 0.5);

		--font-colour: rgb(82, 80, 85);
		--font-colour-light: rgb(125, 123, 123);
		--font-colour-initial: rgb(245, 240, 240);
		--font-colour-initialised: rgb(96, 115, 208);
		--font-colour-locked: rgb(181, 66, 133);
		--font-colour-error: rgb(240, 61, 61);

		--background-colour-1: rgb(247, 156, 156);
		--background-colour-2: rgb(126, 185, 121);
		--background-colour-3: rgb(171, 169, 234);
		--background-colour-4: rgb(67, 203, 224);

		--border-radius: 0.3rem;
		--max-width: 520px;

		--shadow: 0.1rem 0.1rem 0.5rem var(--primary-colour);

		color: var(--font-colour);

		position: relative;

		margin: 0 auto;

		max-width: var(--max-width);
	}

	:global(.container *) {
		box-sizing: border-box;
		font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode',
			Geneva, Verdana, sans-serif;
	}

	.board-container {
		position: relative;
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

	.status {
		color: var(--primary-colour);
		background-color: var(--primary-colour-lighter);
		padding: 0.4rem 1rem;
		margin: 0;
	}

	.menu {
		transform: rotate(0deg);
		transition: all 500ms;
	}

	.menu.showMenu {
		transform: rotate(-90deg);
	}
</style>
