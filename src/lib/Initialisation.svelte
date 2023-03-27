<script lang="ts">
	// OCR implemented using the Tesseract.js library
	// https://github.com/naptha/tesseract.js/
	// https://blog.logrocket.com/how-to-extract-text-from-an-image-using-javascript-8fe282fb0e71/

	import { createEventDispatcher, onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import Command from './Command.svelte';
	import { Mode } from './types';

	export let COLS: number;
	export let ROWS: number;
	export let mode: Mode;
	export let show: boolean;

	const dispatch = createEventDispatcher();

	let loading = 0;

	// $: console.log('show init', show);

	onMount(() => {
		loading = 0;
	});

	async function doOCR(
		image: any,
		worker: any,
		width: number,
		height: number,
		row: number,
		col: number
	): Promise<number> {
		// Specify a border width to avoid OCRing the borders
		const borderWidth = 5;
		const rowHeight = height - 2 * borderWidth;
		const colWidth = width - 2 * borderWidth;
		const rectangle = {
			left: col * width + borderWidth,
			top: row * height + borderWidth,
			width: colWidth,
			height: rowHeight
		};

		await worker.setParameters({
			tessedit_char_whitelist: '123456789'
		});
		const {
			data: { text }
		} = await worker.recognize(image, { rectangle });

		const result = text.trim();
		if (result !== '') {
			// console.log(`(${row}, ${col}) = [${result}]`);
			return parseInt(result);
		}
		return 0;
	}

	async function readCells(img: any, file: any): Promise<number[][]> {
		const width = img.width / COLS;
		const height = img.height / ROWS;

		// console.log('image width and height', width, height);

		const results: number[][] = [];

		const worker = await Tesseract.createWorker();
		await worker.loadLanguage('eng');
		await worker.initialize('eng');

		const total = ROWS * COLS;

		for (let row = 0; row < ROWS; row++) {
			results.push([]);
			for (let col = 0; col < COLS; col++) {
				loading = Math.round((100 * (row * COLS + (col + 1))) / total);
				const value = await doOCR(file, worker, width, height, row, col);
				results[row][col] = value;
			}
		}
		loading = 0;
		show = false;
		await worker.terminate();
		// console.log(results);
		return results;
	}

	async function readFile(event: any, file: any) {
		if (event.target) {
			const contents = event.target.result;
			if (typeof contents === 'string') {
				// Images are loaded asynchronously
				const img = new Image();
				img.onload = async () => {
					const values = await readCells(img, file);
					// console.log(values);
					dispatch('load', { values });
				};
				img.src = contents;
			}
		}
	}

	function handleImageInput(event: Event) {
		if (event.target) {
			const input = <HTMLInputElement>event.target;
			if (input.files && input.files[0]) {
				// console.log('input files', input.files);
				loading = 0.1;
				const file = input.files[0];
				const reader = new FileReader();
				reader.onload = async (event) => await readFile(event, file);
				reader.readAsDataURL(file);
			}
		}
	}
</script>

{#if show && mode === Mode.Initialise}
	<div class="container" transition:fly={{ x: -600, duration: 500 }}>
		{#if loading === 0}
			<h2>
				Initialise the board <div class="close">
					<Command
						title="Return to the board"
						label="<i class='bi bi-x-lg'></i>"
						command="close-init"
						on:command
					/>
				</div>
			</h2>

			<h3>Option 1 - Enter puzzle starting point manually</h3>
			<p>
				Close this dialogue and then set the initial values in the puzzle by hand. Once you have
				finished click the <strong><i class="bi bi-pen" /></strong> icon to begin solving.
			</p>

			<div class="button-container">
				<button title="Close dialogue" on:click={() => (show = false)}>Enter your own values</button
				>
			</div>

			<h3>Option 2 - Load puzzle from a Sudoku board image</h3>
			<p>
				This must be tightly cropped in a square with the same number of rows and columns as the
				board. The file format should be png or jpeg.
			</p>

			<div class="button-container">
				<form method="post" enctype="multipart/form-data">
					<label for="sudoku-img"
						>Load sudoku board image
						<input type="file" id="sudoku-img" on:change={handleImageInput} />
					</label>
				</form>
			</div>

			<h3>Option 3 - Generate a random puzzle</h3>

			<div class="button-container">
				<button
					title="Generate a random puzzle"
					on:click={() => {
						show = false;
						dispatch('command', { command: 'random' });
					}}>Generate random puzzle</button
				>
			</div>
		{:else}
			<div class="progress" class:halfway={loading > 30}>
				Loading board from selected image file...
				<span class="fill" style="width:{loading}%;">&nbsp;</span>
			</div>
		{/if}
	</div>
{/if}

<style>
	.container {
		padding: 1rem;
		position: absolute;
		top: 0;
		left: 0;
		background-color: white;
	}

	h2 {
		color: var(--primary-colour);
		display: flex;
		justify-content: space-between;
	}

	h3 {
		color: var(--primary-colour);
	}

	p {
		text-align: left;
		line-height: 1.4rem;
	}

	.button-container {
		display: flex;
		justify-content: space-around;
		align-items: center;
		padding: 1rem;
	}

	form {
		display: block;
	}

	button {
		margin: 0 auto;
	}

	button,
	label {
		display: block;
		position: relative;
		background: white;
		border: 1px solid var(--primary-colour-lighter);
		border-radius: var(--border-radius);
		padding: 0.5rem 0.8rem;
		font-size: 1rem;
	}

	i {
		border: 1px solid var(--primary-colour-lighter);
		border-radius: var(--border-radius);
		padding: 0.1rem 0.2rem;
	}

	input {
		position: absolute;
		width: 0;
		height: 0;
		visibility: hidden;
		top: -100px;
		left: 100px;
	}
	button:hover,
	label:hover {
		background-color: var(--primary-colour);
		color: white;
	}

	.progress {
		position: relative;
		width: 100%;
		height: 2rem;
		color: white;
		background-color: var(--primary-colour-lighter);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.progress.halfway {
		color: var(--font-colour);
	}

	.fill {
		position: absolute;
		top: 0;
		left: 0;
		display: inline-block;
		height: 2rem;
		background-color: var(--primary-colour);
		opacity: 0.5;
	}
</style>
