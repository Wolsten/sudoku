<script lang="ts">
	import { Mode, SelectMode } from './types';
	import { createEventDispatcher } from 'svelte';

	import { savedGrid } from './stores';

	let mode: Mode = Mode.EnterValue;
	let selectMode: SelectMode;

	// $: dispatch('mode', { mode });
	// $: dispatch('selectMode', { selectMode });

	const dispatch = createEventDispatcher();

	function keydownEvent(key: string) {
		window.dispatchEvent(new KeyboardEvent('keydown', { key }));
	}
</script>

<div class="controls mode"></div>
	<div class="group">
		<label
			title="Use this mode to set up the starting values on the board"
			class:active={mode === Mode.Initialise}
		>
			<span><span class="shortcut">I</span>nitialise</span>
			<input
				type="radio"
				name="mode"
				bind:group={mode}
				value={Mode.Initialise}
				on:click={() => keydownEvent('i')}
			/>
		</label>
		<label
			title="Use this mode to add your (partial) solution to the board"
			class:active={mode === Mode.EnterValue}
		>
			<span><span class="shortcut">E</span>nter value</span>
			<input
				type="radio"
				name="mode"
				bind:group={mode}
				value={Mode.EnterValue}
				on:click={() => keydownEvent('e')}
			/>
		</label>
		<label
			title="Use this mode to pencil in possible values in each cell"
			class:active={mode === Mode.PencilIn}
		>
			<span><span class="shortcut">P</span>encil in</span>
			<input
				type="radio"
				name="mode"
				bind:group={mode}
				value={Mode.PencilIn}
				on:click={() => keydownEvent('p')}
			/>
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
			<input
				type="radio"
				name="selectMode"
				bind:group={selectMode}
				value={SelectMode.Single}
				on:click={() => keydownEvent('s')}
			/>
		</label>
		<label
			title="Allow multiple cell selections and value entry plus pencil marks"
			class:active={selectMode === SelectMode.Multiple}
		>
			<span><span class="shortcut">M</span>ultiple</span>
			<input
				type="radio"
				name="selectMode"
				bind:group={selectMode}
				value={SelectMode.Multiple}
				on:click={() => keydownEvent('m')}
			/>
		</label>
	</div>

	<div class="group">
		<button on:click={() => keydownEvent('c')} title="Clear selections">
			<span class="shortcut">C</span>lear
		</button>
	</div>

	<div class="group colours">
		{#each [1, 2, 3, 4] as index}
			<label style="background-color:var(--background-colour-{index});">
				&nbsp;
				<input type="button" on:click={() => dispatch('colour', { colour: index })} />
			</label>
		{/each}
	</div>
</div>

<div class="controls commands">
	<button on:click={() => keydownEvent('t')} title="Lock pencil marks in selected cells">
		<span class="shortcut">F</span>ix pencil marks
	</button>

	<button
		on:click={() => keydownEvent('h')}
		title="Highlight conflicting cells in rows, columns and boxes"
	>
		<span class="shortcut">H</span>ightlight conflicts
	</button>

	<button
		on:click={() => keydownEvent('v')}
		title="Save the current state of the board. Saved data WILL be lost if you refresh the browser window."
	>
		Sa<span class="shortcut">v</span>e
	</button>

	<button
		on:click={() => keydownEvent('o')}
		title="Restore the previously saved state of the board"
		disabled={$savedGrid.length === 0}
	>
		Rest<span class="shortcut">o</span>re
	</button>

	<button
		on:click={() => keydownEvent('r')}
		title="Restart the puzzle, retaining initial puzzle setup"
	>
		<span class="shortcut">R</span>estart
	</button>

	<button on:click={() => keydownEvent('b')} title="Clear all data on the board">
		Clear <span class="shortcut">b</span>oard
	</button>
</div>

<style>
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
		align-items: center;
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

	.controls label.active .shortcut {
		border-color: white;
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

	.controls button:not([disabled]):hover {
		background-color: var(--primary-colour);
		color: white;
	}

	.controls button[disabled] {
		opacity: 0.5;
		cursor: default;
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

	.controls .group label:first-child {
		border-top-left-radius: var(--border-radius);
		border-bottom-left-radius: var(--border-radius);
	}

	.controls .group label:last-child {
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

	.controls .group.colours label {
		border-color: transparent;
		width: 1.4rem;
		height: 1.4rem;
	}
</style>
