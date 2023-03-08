<script lang="ts">
	import { onMount } from 'svelte';
	import { set_input_value } from 'svelte/internal';

	type Cell = {
		value: number;
		options: number[];
		colours?: string[];
		dom?: HTMLElement;
		selected: boolean;
		pointingPair: boolean;
	};

	const ROWS = 9;
	const COLS = 9;
	const grid: Cell[][] = [];

	// let shiftKey = false;
	// let metaKey = false;
	let lastClicked = 0;

	// Key states
	let initialise = false;
	let pencilIn = false;
	let enterValue = true;
	let selectMultiple = false;

	for (let row = 0; row < ROWS; row++) {
		grid[row] = [];
		for (let col = 0; col < COLS; col++) {
			grid[row][col] = {
				value: 0,
				selected: false,
				options: [],
				pointingPair: false
			};

			if (row === 2 && col === 3) {
				grid[row][col].options = [1, 2, 3, 4, 5, 6, 7, 8, 9];
			}

			if ((row === 5 && col === 6) || (row === 7 && col === 2)) {
				grid[row][col].value = 6;
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

	onMount(() => {
		setCellHeight();
	});

	function clearCellBackgrounds() {
		grid.forEach((row) => {
			row.forEach((cell) => (cell.selected = false));
		});
	}

	function clearBoard() {
		grid.forEach((row, a) => {
			row.forEach((cell, b) => {
				grid[a][b].value = 0;
				grid[a][b].selected = false;
				grid[a][b].options = [];
				grid[a][b].pointingPair = false;
			});
		});
	}

	function toggleOptions(num: number) {
		grid.forEach((row, a) => {
			row.forEach((cell, b) => {
				if (cell.selected) {
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
					grid[a][b].value = num;
					if (initialise) {
						setRow = a;
						setCol = b;
						grid[a][b].selected = false;
					}
				}
			});
		});

		if (initialise) {
			setCol++;
			if (setCol === COLS) {
				setCol = 0;
				setRow++;
				if (setRow === ROWS) setRow = 0;
			}
			grid[setRow][setCol].selected = true;
		}
	}

	function togglePointingPairs() {
		grid.forEach((row, a) => {
			row.forEach((cell, b) => {
				if (cell.selected) {
					if (cell.options.length === 2) {
						grid[a][b].pointingPair = !cell.pointingPair;
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
		if (selectMultiple === false) clearCellBackgrounds();
		grid[row][col].selected = true;
		lastClicked = clickedAt;
	}

	function toggleInitialise() {
		initialise = !initialise;
		if (initialise) {
			cellClicked(0, 0);
			enterValue = false;
		} else {
			enterValue = true;
		}
		pencilIn = false;
	}

	function toggleEnterValue() {
		enterValue = true;
		pencilIn = false;
		initialise = false;
	}

	function togglePencilIn() {
		enterValue = false;
		pencilIn = true;
		initialise = false;
	}

	function toggleSelectMultiple() {
		selectMultiple = !selectMultiple;
	}

	function handleKeydown(event: KeyboardEvent) {
		console.log('keydown', event, event.key);

		// Get the number from the key or the code
		let num: number = Number(event.key);
		// if (isNaN(num)) num = Number(event.code.replace('Digit', ''));
		// if (isNaN(num)) num = -1;
		console.log('Number', num);
		// // Latch control keys
		// if (event.key === 'Meta') metaKey = true;
		// if (event.key === 'Shift') shiftKey = true;
		// console.log('Shift key', shiftKey);

		if (isNaN(num)) {
			if (event.key === 't') {
				togglePointingPairs();
			} else if (event.key === 'i') {
				toggleInitialise();
			} else if (event.key === 'p') {
				togglePencilIn();
			} else if (event.key === 'e') {
				toggleEnterValue();
			}
		} else {
			if (initialise || enterValue) {
				setValue(num);
			} else if (pencilIn) {
				console.log('Toggling options', num);
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

<svelte:window on:resize={setCellHeight} on:keydown={handleKeydown} />

<!------------------------------------------------------------------------------
@section HTML
-------------------------------------------------------------------------------->

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
					class:top={a % 3 === 0}
					class:bottom={a === ROWS - 1}
					class:left={b % 3 === 0}
					class:right={b === COLS - 1}
					class:selected={cell.selected}
					style="flex-basis:{100 / COLS}%"
					bind:this={cell.dom}
					on:pointerdown={() => cellClicked(a, b)}
				>
					{#if cell.value === 0 && optionsString !== ''}
						<span class="options" class:pointingPair={cell.pointingPair}>
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
		<button class:active={initialise} on:click={toggleInitialise}>Initialise (i)</button>
		<button class:active={enterValue} on:click={toggleEnterValue}>Enter value (e)</button>
		<button class:active={pencilIn} on:click={togglePencilIn}>Pencil in (p)</button>
	</div>
	<div class="controls">
		<button on:click={togglePointingPairs}>Toggle pair (t)</button>
		<button class:active={selectMultiple} on:click={toggleSelectMultiple}
			>Select multiple (s)</button
		>
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
	}

	:global(.cell) {
		background-color: white;
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

	.options {
		display: inline-block;
		padding: 0.1rem;
		color: grey;
		font-size: smaller;
	}

	.options.pointingPair {
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
</style>
