<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Mode } from './types';

	export let mode: Mode;

	const dispatch = createEventDispatcher();

	function handleImageInput(event: Event) {
		if (event.target) {
			const input = <HTMLInputElement>event.target;

			if (input.files && input.files[0]) {
				console.log('input files', input.files);

				var reader = new FileReader();
				reader.onload = function (event) {
					if (event.target) {
						const result = event.target.result;
						if (typeof result === 'string') {
							dispatch('image', { imageSrc: result });
						}
					}
				};

				reader.readAsDataURL(input.files[0]);
			}
		}
	}
</script>

{#if mode === Mode.Initialise}
	<div class="message">
		<p>
			Set the initial values in the puzzle and then click the <i class="bi bi-pen" /> icon above to begin
			solving.
		</p>

		<p>
			To make this process easier, load a Sudoku board image behind the board and then enter values
			to match. It should be cropped to the exact size of the board and square so that the cells
			overlap those on the screen above.
		</p>

		<form method="post" enctype="multipart/form-data">
			<label for="sudoku-img"
				>Load sudoku board image
				<input type="file" id="sudoku-img" on:change={handleImageInput} />
			</label>
		</form>
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
</style>
