<script lang="ts">
	import { onMount } from 'svelte';

	import { savedGrid } from './stores';
	import type { Cell, SelectedCell } from './types';
	import { Mode, SelectMode } from './types';

	export let mode: Mode;
	export let selectMode: SelectMode;

	const ROWS = 9;
	const COLS = 9;
	const BOX = 3;

	let grid: Cell[][] = [];
	let lastClicked = 0;
	let selectedCell: SelectedCell = { row: -1, col: -1 };
	let visible = true;

	// -----------------------------------------------------------------------------
	// @section State handling
	// -----------------------------------------------------------------------------

	initialise();

	onMount(() => {
		setCellHeight();
	});

	export const setNumber = function (n: number) {
		if (mode === Mode.Initialise || mode == Mode.EnterValue) {
			setValue(n);
		} else if (mode === Mode.PencilIn) {
			toggleOptions(n);
		}
	};

	export const setCommand = function (command: string) {
		console.log('Board: command=', command);

		switch (command) {
			// Mode
			case 'initialise':
				mode = Mode.Initialise;
				break;
			case 'enter-value':
				mode = Mode.EnterValue;
				break;
			case 'pencil-in':
				mode = Mode.PencilIn;
				break;

			// Select mode
			case 'select-mode-single':
				selectMode = SelectMode.Single;
				clearSelections();
				break;
			case 'select-mode-multiple':
				selectMode = SelectMode.Multiple;
				break;
			case 'select-mode-clear':
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
				break;
			case 'restart':
				restart();
				break;
			case 'clear-board':
				clearBoard();
				break;
		}
	};

	// -----------------------------------------------------------------------------
	// @section Functions
	// -----------------------------------------------------------------------------

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

				if (row === 2 && col === 3) {
					grid[row][col].options = [1, 2, 3, 4, 5, 6, 7, 8, 9];
					grid[row][col].colours = [1, 2, 3, 4];
				}

				if ((row === 5 && col === 6) || (row === 5 && col === 2)) {
					grid[row][col].value = 6;
					grid[row][col].initialised = true;
				}
			}
		}
	}

	function setCellHeight() {
		const width = grid[0][0].dom?.clientWidth;
		console.log('width=', width);
		grid.forEach((row) => {
			row.forEach((cell) => {
				if (cell.dom) {
					cell.dom.style.height = width + 'px';
				}
			});
		});
		visible = true;
	}

	function clearCellBackgrounds() {
		grid.forEach((row) => {
			row.forEach((cell) => (cell.selected = false));
		});
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
					if (list.includes(num)) {
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
					console.log('setting value cell', a, b, mode);
					if (mode === Mode.EnterValue && cell.initialised === false) {
						if (grid[a][b].value === num) {
							grid[a][b].value = 0;
						} else {
							grid[a][b].value = num;
						}
					} else if (mode === Mode.Initialise) {
						console.log('Setting cell to initialised', a, b);
						grid[a][b].value = num;
						grid[a][b].initialised = true;
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

	function handleDoubleClick(value: number) {
		grid.forEach((row, a) => {
			row.forEach((cell, b) => {
				grid[a][b].selected = cell.value === value;
			});
		});
	}

	function cellClicked(row: number, col: number) {
		const clickedAt = new Date().getTime();
		// console.log('cell clicked', row + 1, col + 1, clickedAt);
		if (clickedAt - lastClicked < 300) {
			// console.log('Double clicked');
			lastClicked = 0;
			if (grid[row][col].value > 0) {
				clearCellBackgrounds();
				handleDoubleClick(grid[row][col].value);
			}
			return;
		}
		if (selectMode === SelectMode.Single) clearCellBackgrounds();
		grid[row][col].selected = true;
		selectedCell = { row, col };
		lastClicked = clickedAt;
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

	function saveBoard() {
		grid.forEach((row, a) => {
			$savedGrid[a] = [];
			row.forEach((cell, b) => {
				$savedGrid[a][b] = {
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

	function restoreBoard() {
		$savedGrid.forEach((row, a) => {
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

	function getStyle(colours: number[]): string {
		const width = 100 / COLS;
		let style = `width:${width}%; height:${width}%; `;
		if (colours.length === 0) return style;
		const inc = 360 / colours.length;
		let angle = 0;
		style += `background: conic-gradient(`;
		for (let index = 0; index < colours.length; index++) {
			const colour = `var(--background-colour-${colours[index]})`;
			const angle1 = angle;
			const angle2 = angle + inc;
			style += `${colour} ${angle1}deg ${angle2}deg`;
			if (index < colours.length - 1) style += `,`;
			angle += inc;
		}
		style += `);`;
		// console.log('style', style);
		return style;
	}
</script>

<!------------------------------------------------------------------------------
@section HTML
-------------------------------------------------------------------------------->

<svelte:window on:resize={setCellHeight} />

<div class="container">
	<div class="board" class:visible class:initialising={mode === Mode.Initialise}>
		{#each grid as row, a}
			{#each row as cell, b}
				{@const optionsString = cell.options ? cell.options.sort((a, b) => a - b).join(' ') : ''}
				{@const style = getStyle(cell.colours)}
				<span
					class="cell"
					class:top={a % BOX === 0}
					class:bottom={a === ROWS - 1}
					class:left={b % BOX === 0}
					class:right={b === COLS - 1}
					class:selected={cell.selected}
					class:initialised={cell.initialised}
					class:error={cell.error}
					class:coloured={cell.colours.length > 0}
					{style}
					bind:this={cell.dom}
					on:pointerdown={() => cellClicked(a, b)}
				>
					&nbsp;
					{#if cell.value === 0 && optionsString !== ''}
						<span class="options" class:fixed={cell.fixed}>
							{optionsString}
						</span>
					{/if}

					{#if cell.value > 0}
						<span class="value">{cell.value}</span>
					{/if}
				</span>
			{/each}
		{/each}
	</div>
</div>

<!------------------------------------------------------------------------------

@section Styling

-------------------------------------------------------------------------------->
<style>
	.container {
		width: 100%;
		display: flex;
		justify-content: center;

		padding: 0.5rem 3%;
	}

	.board {
		visibility: hidden;
		position: relative;
		width: 100%;
		max-width: 600px;
	}

	.board.visible {
		visibility: visible;
	}

	.cell {
		position: relative;
		margin: 0;
		padding: 0;

		border: 1px solid var(--primary-colour-lighter);
		background-color: white;
		cursor: pointer;
		display: inline-block;
	}

	.board.initialising .cell.initialised {
		background-color: var(--font-colour-initial);
	}

	.cell.top {
		border-top-color: var(--primary-colour);
	}

	.cell.bottom {
		border-bottom-color: var(--primary-colour);
	}

	.cell.left {
		border-left-color: var(--primary-colour);
	}

	.cell.right {
		border-right-color: var(--primary-colour);
	}

	.cell.error .value {
		color: var(--font-colour-error);
	}

	.cell.selected {
		outline: auto;
		outline-color: var(--primary-colour);
		outline-width: 3px;
		outline-offset: 0px;
	}

	.options {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: inline-block;
		padding: 0.1rem;
		color: var(--font-colour-light);
		font-size: 0.7rem;
		line-height: 0.8rem;
	}

	.options.fixed {
		display: flex;
		justify-content: center;
		align-items: center;
		font-weight: bold;
		font-size: 0.8rem;
	}

	.cell.coloured .options {
		color: white;
	}

	.value {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
