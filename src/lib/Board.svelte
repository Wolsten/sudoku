<script lang="ts">
	import { onMount } from 'svelte';

	import { savedGrid } from './stores';

	import type { Cell, SelectedCell } from './types';

	import { Mode, SelectMode } from './types';

	const ROWS = 9;
	const COLS = 9;
	const BOX = 3;

	let grid: Cell[][] = [];
	let lastClicked = 0;

	export let mode: Mode;
	export let selectMode: SelectMode;
	export let command = '';

	let selectedCell: SelectedCell = { row: -1, col: -1 };

	let visible = false;

	$: console.log('board mode', mode);

	// -----------------------------------------------------------------------------
	// @section State handling
	// -----------------------------------------------------------------------------

	initialise();

	onMount(() => {
		setCellHeight();
	});

	$: switch (command) {
		case 'f':
			fixPencilMarks();
			break;
		case 'h':
			showConflicts();
			break;
		case 'v':
			saveBoard();
			break;
		case 'o':
			restoreBoard();
			break;
		case 'r':
			restart();
			break;
		case 'b':
			clearBoard();
			break;
	}

	$: if (selectMode === SelectMode.Clear) {
		clearSelections();
		selectMode = SelectMode.Single;
	}

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
					paired: false,
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

	function handleMode(event: any) {
		mode = event.detail.mode;
		console.log('New mode', mode);
		if (mode === Mode.Initialise) cellClicked(0, 0);
	}

	function handleSelectMode(event: any) {
		selectMode = event.detail.selectMode;
		console.log('New select mode', selectMode);
		if (selectMode === SelectMode.Single || SelectMode.Multiple) clearSelections();
	}

	function setCellHeight() {
		const width = grid[0][0].dom?.clientWidth;
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
				grid[a][b].selected = false;
			});
		});
	}

	function fixPencilMarks() {
		grid.forEach((row, a) => {
			row.forEach((cell, b) => {
				if (cell.selected) {
					grid[a][b].paired = !cell.paired;
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
					grid[a][b].paired = false;
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
				grid[a][b].paired = false;
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
						console.log('found column mistake in cell', row, col1);
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
		// let setRow = -1;
		// let setCol = -1;
		console.log('setting value');
		grid.forEach((row, a) => {
			row.forEach((cell, b) => {
				if (cell.selected) {
					console.log('setting value cell', a, b, mode);
					if (mode === Mode.EnterValue && cell.initialised === false) {
						grid[a][b].value = num;
					} else if (mode === Mode.Initialise) {
						// setRow = a;
						// setCol = b;
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
		console.log('cell clicked', row + 1, col + 1, clickedAt);
		if (clickedAt - lastClicked < 300) {
			console.log('Double clicked');
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
					grid[a][b].paired = false;
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
					paired: cell.paired,
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
					paired: cell.paired,
					initialised: cell.initialised,
					error: cell.error
				};
			});
		});
	}

	function handleColour(event: any) {
		const colour = event.detail.colour;
		console.log('new colour', colour);
		grid.forEach((row, a) => {
			row.forEach((cell, b) => {
				if (cell.selected) {
					let colours = cell.colours;
					if (colours.includes(colour)) {
						colours = colours.filter((c) => c !== colour);
					} else {
						colours.push(colour);
					}
					grid[a][b].colours = [...colours];
				}
			});
		});
	}

	function getPieStyle(colours: number[]): string {
		if (colours.length === 0) return '';
		const inc = 360 / colours.length;
		let angle = 0;
		let style = `background: conic-gradient(`;
		for (let index = 0; index < colours.length; index++) {
			const colour = `var(--background-colour-${colours[index]})`;
			const angle1 = angle;
			const angle2 = angle + inc;
			style += `${colour} ${angle1}deg ${angle2}deg`;
			if (index < colours.length - 1) style += `,`;
			angle += inc;
		}
		style += `);`;
		console.log('style', style);
		return style;
	}

	function handleKeydown(event: KeyboardEvent) {
		console.log('keydown', event, event.key);

		// Get the number from the key or the code
		let num: number = Number(event.key);
		console.log('Number', num);

		// Check none-numbers first
		if (isNaN(num)) {
			switch (event.key) {
				// case 'f':
				// 	fixPencilMarks();
				// 	break;
				// case 'i':
				// 	mode = mode === Mode.Initialise ? Mode.EnterValue : Mode.Initialise;
				// 	break;
				// case 'p':
				// 	mode = Mode.PencilIn;
				// 	break;
				// case 'e':
				// 	mode = Mode.EnterValue;
				// 	break;
				// case 'r':
				// 	restart();
				// 	break;
				// case 's':
				// 	selectMode = SelectMode.Single;
				// 	break;
				// case 'm':
				// 	selectMode = SelectMode.Multiple;
				// 	break;
				// case 'c':
				// 	clearSelections();
				// 	break;
				// case 'b':
				// 	clearBoard();
				// 	break;
				// case 'h':
				// 	showConflicts();
				// 	break;
				// case 'v':
				// 	saveBoard();
				// 	break;
				// case 'o':
				// 	restoreBoard();
				// 	break;
				case 'ArrowLeft':
				case 'ArrowRight':
				case 'ArrowUp':
				case 'ArrowDown':
					event.preventDefault();
					if (selectMode === SelectMode.Single) moveSelection(event.key);
					break;
				case 'Backspace':
					clearSelectedEntries();
					break;
			}
			// Otherwise enter the number as a value or toggle a pencilled option
			// Values and pencil marks are entered in all selected cells
		} else {
			if (mode === Mode.Initialise || mode == Mode.EnterValue) {
				setValue(num);
			} else if (mode === Mode.PencilIn) {
				toggleOptions(num);
			}
		}
	}

	// function handleKeyup(event: KeyboardEvent) {
	// 	console.log('keyup', event, event.key);
	// 	if (event.key === 'Meta') metaKey = false;
	// 	if (event.key === 'Shift') shiftKey = false;
	// }
</script>

<!------------------------------------------------------------------------------
@section HTML
-------------------------------------------------------------------------------->

<svelte:window on:resize={setCellHeight} on:keydown={handleKeydown} />

<div class="container">
	<h1>Sudoku Board</h1>

	<div class="board" class:visible class:initialising={mode === Mode.Initialise}>
		{#each grid as row, a}
			<div class="row">
				<!-- <span class="label">{a + 1}</span> -->
				{#each row as cell, b}
					{@const optionsString = cell.options ? cell.options.sort((a, b) => a - b).join(' ') : ''}
					{@const backgroundStyle = getPieStyle(cell.colours)}
					<span
						class="cell"
						class:top={a % BOX === 0}
						class:bottom={a === ROWS - 1}
						class:left={b % BOX === 0}
						class:right={b === COLS - 1}
						class:selected={cell.selected}
						class:initialised={cell.initialised}
						class:error={cell.error}
						style={backgroundStyle}
						bind:this={cell.dom}
						on:pointerdown={() => cellClicked(a, b)}
					>
						{#if cell.value === 0 && optionsString !== ''}
							<span class="options" class:paired={cell.paired}>
								{optionsString}
							</span>
						{/if}

						{#if cell.value > 0}
							<span class="value">{cell.value}</span>
						{/if}
					</span>
				{/each}
			</div>
		{/each}
	</div>
</div>

<!------------------------------------------------------------------------------

@section Styling

-------------------------------------------------------------------------------->
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

	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.board {
		position: relative;
		visibility: hidden;
		position: relative;
		width: 100%;
		max-width: 600px;
		padding: 0 0.5rem;
	}

	.board.visible {
		visibility: visible;
	}

	h1 {
		text-align: center;
		position: relative;
	}

	.row {
		display: grid;
		grid-auto-columns: minmax(0, 1fr);
		grid-auto-flow: column;
	}

	.label {
		color: var(--font-colour-light);
	}

	.cell {
		position: relative;
		padding: 0;
		border: 1px solid var(--primary-colour-lighter);
		background-color: white;
	}

	.board.initialising .cell.initialised {
		background-color: var(--font-colour-initial);
	}

	.cell.selected {
		background-color: var(--select-colour);
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

	.options {
		display: inline-block;
		padding: 0.1rem;
		color: var(--font-colour-light);
		font-size: 0.7rem;
		line-height: 0.8rem;
	}

	.options.paired {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 0.8rem;
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
