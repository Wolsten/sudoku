<script lang="ts">
	// To be extended with Tesseract:
	// https://github.com/naptha/tesseract.js/
	// https://blog.logrocket.com/how-to-extract-text-from-an-image-using-javascript-8fe282fb0e71/

	import { createEventDispatcher, onMount } from 'svelte';
	import { Mode } from './types';

	export let COLS: number;
	export let ROWS: number;
	export let mode: Mode;

	const dispatch = createEventDispatcher();

	let loading = 0;

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

		console.log('image width and height', width, height);

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
		await worker.terminate();
		// console.log(results);
		return results;
	}

	async function readFile(event: any, file: any) {
		if (event.target) {
			const contents = event.target.result;
			if (typeof contents === 'string') {
				// If debugging can uncomment
				// dispatch('image', { imageSrc: contents });
				// Images are loaded asynchronously
				const img = new Image();
				img.onload = async () => {
					const values = await readCells(img, file);
					console.log(values);
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
				console.log('input files', input.files);
				const file = input.files[0];
				const reader = new FileReader();
				reader.onload = async (event) => await readFile(event, file);
				reader.readAsDataURL(file);
			}
		}
	}
</script>

{#if mode === Mode.Initialise}
	<div class="message">
		{#if loading === 0}
			<p>
				Set the initial values in the puzzle and then click the <i class="bi bi-pen" /> icon above to
				begin solving.
			</p>

			<p>
				Alternatively, load a Sudoku board image and we will use OCR to automatically read the
				values. Your image must be tightly cropped in a square with the same number of rows and
				columns as the board above. This process may incur problems so you may need to edit the
				board before starting to solve.
			</p>

			<form method="post" enctype="multipart/form-data">
				<label for="sudoku-img"
					>Load sudoku board image
					<input type="file" id="sudoku-img" on:change={handleImageInput} />
				</label>
			</form>
		{:else}
			<div class="progress">
				Loading board from selected image file...
				<span class="fill" style="width:{loading}%;">&nbsp;</span>
			</div>
		{/if}
	</div>
{/if}

<style>
	.message {
		margin: 1rem 0.5rem 0 0.5rem;
		text-align: center;
	}

	p {
		text-align: left;
	}

	form {
		display: block;
		padding-top: 1rem;
	}

	label {
		position: relative;
		border: 1px solid var(--primary-colour-lighter);
		border-radius: var(--border-radius);
		padding: 0.5rem 0.8rem;
		font-weight: bold;
	}
	input {
		position: absolute;
		width: 0;
		height: 0;
		visibility: hidden;
		top: -100px;
		left: 100px;
	}
	label:hover {
		border: 1px solid var(--primary-colour);
	}

	.progress {
		position: relative;
		width: 100%;
		height: 2rem;
		background-color: var(--primary-colour-lighter);
		display: flex;
		justify-content: center;
		align-items: center;
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
