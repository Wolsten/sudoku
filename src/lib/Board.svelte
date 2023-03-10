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
	let mode: Mode = Mode.EnterValue;
	let selectMode: SelectMode = SelectMode.Single;
	let selectedCell: SelectedCell = { row: -1, col: -1 };
	let visible = false;

	// -----------------------------------------------------------------------------
	// @section State handling
	// -----------------------------------------------------------------------------

	initialise();

	onMount(() => {
		setCellHeight();
	});

	$: switch (mode) {
		case Mode.Initialise:
			cellClicked(0, 0);
			break;
	}

	$: if (selectMode === SelectMode.Single || SelectMode.Multiple) clearSelections();

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
					paired: false,
					initialised: false,
					error: false
				};

				if (row === 2 && col === 3) {
					grid[row][col].options = [1, 2, 3, 4, 5, 6, 7, 8, 9];
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
				grid[a][b].selected = false;
			});
		});
	}

	function clearCellBackgrounds() {
		grid.forEach((row) => {
			row.forEach((cell) => (cell.selected = false));
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
		let setRow = -1;
		let setCol = -1;
		grid.forEach((row, a) => {
			row.forEach((cell, b) => {
				if (cell.selected) {
					if (mode === Mode.Initialise || cell.initialised === false) {
						grid[a][b].value = num;
					}
					if (mode === Mode.Initialise) {
						setRow = a;
						setCol = b;
						grid[a][b].selected = false;
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

	function togglePairs() {
		grid.forEach((row, a) => {
			row.forEach((cell, b) => {
				if (cell.selected) {
					if (cell.options.length === 2) {
						grid[a][b].paired = !cell.paired;
					}
				}
			});
		});
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
		console.log(
			'saved before save',
			$savedGrid[0] && $savedGrid[0][0] ? $savedGrid[0][0]?.value : 0
		);
		console.log('grid before save', grid[0][0].value);

		grid.forEach((row, a) => {
			$savedGrid[a] = [];
			row.forEach((cell, b) => {
				$savedGrid[a][b] = {
					value: cell.value,
					selected: cell.selected,
					options: [...cell.options],
					paired: cell.paired,
					initialised: cell.initialised,
					error: cell.error
				};
			});
		});

		console.log('saved after save', $savedGrid[0][0].value);
		console.log('grid after save', grid[0][0].value);
	}

	function restoreBoard() {
		console.log('saved before restore', $savedGrid[0][0].value);
		console.log('grid before restore', grid[0][0].value);
		$savedGrid.forEach((row, a) => {
			grid[a] = [];
			row.forEach((cell, b) => {
				grid[a][b] = {
					value: cell.value,
					selected: cell.selected,
					options: [...cell.options],
					paired: cell.paired,
					initialised: cell.initialised,
					error: cell.error
				};
			});
		});
		console.log('saved after restore', $savedGrid[0][0].value);
		console.log('grid after restore', grid[0][0].value);
	}

	function handleKeydown(event: KeyboardEvent) {
		console.log('keydown', event, event.key);

		// Get the number from the key or the code
		let num: number = Number(event.key);
		console.log('Number', num);

		// Check none-numbers first
		if (isNaN(num)) {
			switch (event.key) {
				case 't':
					togglePairs();
					break;
				case 'i':
					mode = mode === Mode.Initialise ? Mode.EnterValue : Mode.Initialise;
					break;
				case 'p':
					mode = Mode.PencilIn;
					break;
				case 'e':
					mode = Mode.EnterValue;
					break;
				case 'r':
					restart();
					break;
				case 's':
					selectMode = SelectMode.Single;
					break;
				case 'm':
					selectMode = SelectMode.Multiple;
					break;
				case 'a':
					clearSelections();
					break;
				case 'b':
					clearBoard();
					break;
				case 'c':
					showConflicts();
					break;
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
		<div class="col-header">
			{#each grid[0] as col, b}
				<span class="label">
					{b + 1}
				</span>
			{/each}
		</div>

		<div class="row-header">
			{#each grid[0] as col, b}
				<span class="label">
					{b + 1}
				</span>
			{/each}
		</div>

		{#each grid as row, a}
			<div class="row">
				<!-- <span class="label">{a + 1}</span> -->
				{#each row as cell, b}
					{@const optionsString = cell.options ? cell.options.sort((a, b) => a - b).join(' ') : ''}
					<span
						class="cell"
						class:top={a % BOX === 0}
						class:bottom={a === ROWS - 1}
						class:left={b % BOX === 0}
						class:right={b === COLS - 1}
						class:selected={cell.selected}
						class:initialised={cell.initialised}
						class:error={cell.error}
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

	<div class="controls mode">
		<div class="group">
			<label
				title="Use this mode to set up the starting values on the board"
				class:active={mode === Mode.Initialise}
			>
				<span><span class="shortcut">I</span>nitialise</span>
				<input type="radio" name="mode" bind:group={mode} value={Mode.Initialise} />
			</label>
			<label
				title="Use this mode to add your (partial) solution to the board"
				class:active={mode === Mode.EnterValue}
			>
				<span><span class="shortcut">E</span>nter value</span>
				<input type="radio" name="mode" bind:group={mode} value={Mode.EnterValue} />
			</label>
			<label
				title="Use this mode to pencil in possible values in each cell"
				class:active={mode === Mode.PencilIn}
			>
				<span><span class="shortcut">P</span>encil in</span>
				<input type="radio" name="mode" bind:group={mode} value={Mode.PencilIn} />
			</label>
		</div>
	</div>

	<div class="controls select">
		<div class="group">
			<label
				title="Only allow single cell selections"
				class:active={selectMode === SelectMode.Single}
			>
				<span><span class="shortcut">S</span>ingle</span>
				<input type="radio" name="selectMode" bind:group={selectMode} value={SelectMode.Single} />
				<span class="checkmark" />
			</label>
			<label
				title="Allow multiple cell selections and value entry plus pencil marks"
				class:active={selectMode === SelectMode.Multiple}
			>
				<span><span class="shortcut">M</span>ultiple</span>
				<input type="radio" name="selectMode" bind:group={selectMode} value={SelectMode.Multiple} />
				<span class="checkmark" />
			</label>
		</div>

		<div class="group">
			<button on:click={clearSelections} title="Clear selections">
				C<span class="shortcut">l</span>ear
			</button>
		</div>
	</div>

	<div class="controls commands">
		<button on:click={togglePairs} title="Where selected cells have only two options, mark these">
			<span class="shortcut">T</span>oggle pair
		</button>

		<button on:click={showConflicts} title="Show conflicting cells in rows, columns and boxes">
			Show <span class="shortcut">c</span>onflicts
		</button>

		<button on:click={saveBoard} title="Save the current state of the board"> Save </button>

		<button
			on:click={restoreBoard}
			title="Restore the previously saved state of the board"
			disabled={$savedGrid.length === 0}
		>
			Restore
		</button>

		<button on:click={restart} title="Restart the puzzle, retaining initial puzzle setup">
			<span class="shortcut">R</span>estart
		</button>

		<button on:click={clearBoard} title="Clear all data on the board">
			Clear <span class="shortcut">b</span>oard
		</button>
	</div>
</div>

<!------------------------------------------------------------------------------

@section Styling

-------------------------------------------------------------------------------->
<style>
	:global(body) {
		width: 90vw;
		/* border: 1px solid green; */
		margin: 0;
	}

	.container * {
		box-sizing: border-box;
		font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode',
			Geneva, Verdana, sans-serif;

		/* Variables */
		--heavy-lines: 5px;
		--primary-colour: rgb(84, 79, 97);
		--primary-colour-lighter: rgb(187, 198, 214);
		--select-colour: rgb(161, 223, 176);
		--font-colour: rgb(71, 68, 79);
		--font-colour-light: rgb(125, 123, 123);
		--font-colour-initial: rgb(245, 240, 240);
		--font-colour-error: red;

		color: var(--font-colour);
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
		padding: 0 1rem;
	}

	.board.visible {
		visibility: visible;
	}

	h1 {
		text-align: center;
		position: relative;
	}

	.col-header {
		display: flex;
		justify-content: space-around;
		margin-bottom: 0.3rem;
		font-size: 0.8rem;
	}

	.row-header {
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		position: absolute;
		left: 0.1rem;
		height: 95%;
		font-size: 0.8rem;
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

	.selected .value,
	.selected .options {
		color: white;
	}

	.controls {
		margin-top: 1rem;
		width: 94%;
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		border: 1px solid var(--primary-colour);
		border-radius: 0.3rem;
		gap: 1rem;
		padding: 1rem;
		margin: 1rem 3%;
		position: relative;
	}

	.group {
		display: flex;
		justify-content: flex-start;
	}

	/* Control area titles */

	.controls::after {
		position: absolute;
		top: -0.8rem;
		left: 1rem;
		font-size: 0.8rem;
		background: white;
		padding: 0.3rem;
	}

	.controls .shortcut {
		display: inline-block;
		border-bottom: 1px solid var(--font-colour);
	}

	.controls.mode::after {
		content: 'Mode';
	}
	.controls.select::after {
		content: 'Cell selection';
	}
	.controls.commands::after {
		content: 'Commands';
	}

	.controls.commands {
		gap: 1rem;
	}

	.controls button {
		background-color: white;
		padding: 0.3rem 0.6rem;
		border: 1px solid var(--primary-colour-lighter);
		border-radius: 0.2rem;
	}

	.controls button[disabled] {
		color: var(--primary-colour-lighter);
		cursor: default;
	}

	.controls button:not([disabled]):hover {
		border-color: var(--primary-colour-lighter);
		background-color: var(--primary-colour-lighter);
		cursor: pointer;
	}

	/* Customize the label (the container) */
	.controls label {
		font-size: 0.9rem;
		display: flex;
		flex-direction: row-reverse;
		align-items: center;
		gap: 0.3rem;

		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;

		padding: 0.3rem 0.5rem;
		border-top: 1px solid var(--primary-colour-lighter);
		border-bottom: 1px solid var(--primary-colour-lighter);
		border-left: 1px solid var(--primary-colour-lighter);

		--border-radius: 0.3rem;
	}

	.controls label:hover {
		background-color: var(--primary-colour-lighter);
		cursor: pointer;
	}

	.controls label.active {
		background-color: var(--primary-colour);
		border-color: var(--primary-colour);
		cursor: default;
	}

	.controls label.active span {
		color: white;
	}

	.controls label:first-child {
		border-top-left-radius: var(--border-radius);
		border-bottom-left-radius: var(--border-radius);
	}

	.controls label:last-child {
		border-right: 1px solid var(--primary-colour-lighter);
		border-top-right-radius: var(--border-radius);
		border-bottom-right-radius: var(--border-radius);
	}

	/* Hide the browser's default radio button */
	.controls label input {
		position: absolute;
		opacity: 0;
		cursor: pointer;
		height: 0;
		width: 0;
		margin: 0;
	}
</style>
