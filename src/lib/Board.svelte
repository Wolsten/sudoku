<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

	import type { Cell, SelectedCell } from './types';
	import { Mode, SelectMode } from './types';

	export let grid: Cell[][];
	export let mode: Mode;
	export let selectMode: SelectMode;
	export let ROWS: number;
	export let COLS: number;
	export let BOX: number;
	export let selectedCell: SelectedCell = { row: -1, col: -1 };
	export let crosshair: boolean;

	const dispatch = createEventDispatcher();

	let board: HTMLDivElement;
	let lastClicked = 0;
	let visible = false;

	onMount(() => {
		handleResize();
	});

	function showCrosshair(row: number, col: number) {
		grid.forEach((r, i) => {
			r.forEach((cell, j) => {
				if ((row === i && col !== j) || (row !== i && col === j)) {
					cell.crosshair = true;
				}
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

		grid[row][col].selected = !grid[row][col].selected;

		if (crosshair && selectMode === SelectMode.Single && grid[row][col].selected)
			showCrosshair(row, col);

		if (grid[row][col].selected) {
			selectedCell = { row, col };
			dispatch('command', { command: grid[row][col].locked ? 'cell-locked' : 'cell-unlocked' });
		} else {
			selectedCell = { row: -1, col: -1 };
		}

		lastClicked = clickedAt;
		dispatch('command', { command: 'close-menu' });
	}

	function handleDoubleClick(value: number) {
		grid.forEach((row, a) => {
			row.forEach((cell, b) => {
				grid[a][b].selected = cell.value === value;
			});
		});
	}

	function clearCellBackgrounds() {
		grid.forEach((row) => {
			row.forEach((cell) => {
				cell.selected = false;
				cell.crosshair = false;
			});
		});
	}

	function getStyle(colours: number[]): string {
		const width = 100 / COLS;
		let style = `width:${width}%;height:${width}%;`;
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

	function getTitle(cell: Cell): string {
		let title = 'This is an empty cell';
		if (cell.initialised) {
			title =
				'This cell contains an initial given value for the puzzle. It cannot be changed unless you re-initialise the board.';
		} else if (cell.value > 0) {
			title = 'This cell contains a solution value.';
		} else {
			if (cell.options.length > 0) {
				title = 'This cell contains one or more pencilled options.';
				if (cell.locked) {
					title +=
						' These pencilled options have been locked as the only possibilities in this cell.';
				}
			}
		}
		// console.log('title=', title);
		return title;
	}

	function handleResize() {
		if (board) {
			const width = board.clientWidth;
			// console.log('setting cell heights to ', width);
			board.style.height = width + 'px';
		}
		visible = true;
	}
</script>

<!------------------------------------------------------------------------------
@section HTML
-------------------------------------------------------------------------------->

<svelte:window on:resize={handleResize} />

<div class="container" class:visible>
	<div class="board" class:initialising={mode === Mode.Initialise} bind:this={board}>
		{#each grid as row, a}
			{#each row as cell, b}
				{@const optionsString = cell.options ? cell.options.sort((a, b) => a - b).join(' ') : ''}
				{@const style = getStyle(cell.colours)}
				{@const title = getTitle(cell)}
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
					class:crosshair={cell.crosshair}
					{style}
					{title}
					on:pointerdown={() => cellClicked(a, b)}
				>
					&nbsp;
					{#if cell.value === 0 && optionsString !== ''}
						<span
							class="options"
							class:locked={cell.locked}
							class:busy={cell.options.length > 4}
							class:really-busy={cell.options.length > 6}
						>
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
		opacity: 0;
		transition: all 1000ms;
	}

	.container.visible {
		opacity: 1;
		visibility: visible;
	}

	@media (max-width: 580px) {
		.container {
			padding: 0.5rem 0px;
		}
	}

	.board {
		position: relative;
		width: 100%;
		max-width: var(--max-width);
	}

	.cell {
		position: relative;
		margin: 0;
		padding: 0;

		border: 1px solid var(--primary-colour-lighter);
		background-color: white;
		opacity: 0.8;

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

	.cell .value {
		font-size: 1.6rem;
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

	.cell.initialised {
		color: var(--font-colour-initialised);
	}

	.cell.crosshair {
		background-color: var(--crosshair-colour);
	}

	.options {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: inline-block;
		padding: 0.2rem;
		color: var(--font-colour-light);
		font-size: 1rem;
		line-height: 1.1rem;
	}

	@media (max-width: 580px) {
		.options {
			font-size: 0.9rem;
			line-height: 1rem;
		}
		.options.busy {
			font-size: 0.8rem;
			line-height: 0.9rem;
		}

		.options.busy.really-busy {
			font-size: 0.7rem;
			line-height: 0.75rem;
		}
	}

	.options.locked {
		display: flex;
		justify-content: center;
		align-items: center;
		font-weight: bold;
		font-size: 0.9rem;
		line-height: 1rem;
		font-weight: bold;
		color: var(--font-colour-locked);
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
