<script lang="ts">
	import { onMount } from 'svelte';
	import { set_input_value } from 'svelte/internal';

	type Cell = {
		initialised: boolean;
		value: number;
		options: number[];
		colours?: string[];
		dom?: HTMLElement;
		selected: boolean;
		paired: boolean;
		error: boolean;
	};

	enum Mode {
		Initialise = 0,
		EnterValue = 1,
		PencilIn = 2
	}

	enum SelectMode {
		Single = 0,
		Multiple = 1
	}

	type SelectedCell = {
		row: number;
		col: number;
	};

	const ROWS = 9;
	const COLS = 9;
	const BOX = 3;
	const grid: Cell[][] = [];

	let lastClicked = 0;
	let mode: Mode = Mode.EnterValue;
	let selectMode: SelectMode = SelectMode.Single;
	let selectedCell: SelectedCell = { row: -1, col: -1 };

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
		grid.forEach((row) => {
			row.forEach((cell) => {
				if (cell.dom) {
					cell.dom.style.height = cell.dom.clientWidth + 'px';
				}
			});
		});
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

<div class="board">
	<h1>Sudoku Board</h1>

	<div class="col-header">
		<span class="label">&nbsp;</span>
		{#each grid[0] as col, b}
			<span class="label" style="flex-basis:{100 / COLS}%">
				{b + 1}
			</span>
		{/each}
	</div>

	{#each grid as row, a}
		<div class="row">
			<span class="label"><span>{a + 1}</span></span>
			{#each row as cell, b}
				{@const optionsString = cell.options ? cell.options.join(' ') : ''}
				<span
					class="cell"
					class:top={a % BOX === 0}
					class:bottom={a === ROWS - 1}
					class:left={b % BOX === 0}
					class:right={b === COLS - 1}
					class:selected={cell.selected}
					class:initialised={cell.initialised}
					class:error={cell.error}
					style="flex-basis:{100 / COLS}%"
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

	<div class="controls">
		<label
			>Initialise (i)
			<input type="radio" name="mode" bind:group={mode} value={Mode.Initialise} />
			<span class="checkmark" />
		</label>

		<label
			>Enter value(e)
			<input type="radio" name="mode" bind:group={mode} value={Mode.EnterValue} />
			<span class="checkmark" />
		</label>

		<label
			>Pencil in (p)
			<input type="radio" name="mode" bind:group={mode} value={Mode.PencilIn} />
			<span class="checkmark" />
		</label>
	</div>

	<div class="controls">
		<label
			>Select single cells
			<input type="radio" name="selectMode" bind:group={selectMode} value={SelectMode.Single} />
			<span class="checkmark" />
		</label>

		<label
			>Select multiple cells
			<input type="radio" name="selectMode" bind:group={selectMode} value={SelectMode.Multiple} />
			<span class="checkmark" />
		</label>
	</div>

	<div class="controls">
		<button on:click={togglePairs}>Toggle pair (t)</button>
		<button on:click={showConflicts}>Show conflicts (s)</button>
		<button on:click={restart}>Restart (r)</button>
		<button on:click={clearBoard}>Clear board (c)</button>
	</div>
</div>

<!------------------------------------------------------------------------------
@section Styling
-------------------------------------------------------------------------------->
<style>
	.board {
		position: relative;
		max-width: 600px;
		box-sizing: border-box;
		font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode',
			Geneva, Verdana, sans-serif;
		--heavy: 5px;
	}

	h1 {
		text-align: center;
		position: relative;
	}

	.col-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.5rem;
	}

	.label {
		border: none;
		text-align: center;
		color: grey;
	}

	.row {
		display: flex;
		justify-content: space-between;
	}

	.row .label {
		margin-right: 0.5rem;
		display: flex;
		align-items: center;
	}

	.cell {
		position: relative;
		padding: 0;
		border: 1px solid grey;
		background-color: white;
	}

	.cell.initialised {
		background-color: rgb(227, 236, 243);
	}

	.cell.selected {
		background-color: green;
	}

	.cell.top {
		border-top-width: var(--heavy);
	}

	.cell.bottom {
		border-bottom-width: var(--heavy);
	}

	.cell.left {
		border-left-width: var(--heavy);
	}

	.cell.right {
		border-right-width: var(--heavy);
	}

	.cell.error {
		color: red;
	}

	.options {
		display: inline-block;
		padding: 0.1rem;
		color: grey;
		font-size: smaller;
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
		width: 100%;
		display: flex;
		justify-content: space-around;
	}

	.controls button {
		background-color: palegoldenrod;
		padding: 0.3rem 0.6rem;
		border: 1px solid grey;
		border-radius: 0.2rem;
	}

	.controls button:hover {
		background-color: rgb(170, 164, 102);
	}

	.controls button.active {
		background-color: rgb(156, 68, 68);
		color: white;
	}

	/* Customize the label (the container) */
	label {
		display: flex;
		flex-direction: row-reverse;
		gap: 0.5rem;
		cursor: pointer;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}

	/* Hide the browser's default radio button */
	label input {
		position: absolute;
		opacity: 0;
		cursor: pointer;
		height: 0;
		width: 0;
	}

	/* Create a custom radio button */
	label .checkmark {
		box-sizing: border-box;
		position: relative;
		height: 1.4rem;
		width: 1.4rem;
		background-color: #eee;
		border: 0.4rem solid #eee;
		border-radius: 50%;
	}

	/* On mouse-over, add a grey background color */
	label:hover .checkmark {
		background-color: #ccc;
		border-color: #ccc;
	}

	/* When the radio button is checked, add a blue background */
	label input:checked ~ .checkmark {
		background-color: white;
		border-color: #2196f3;
	}
</style>
