<script lang="ts">
	import { Mode } from './types';
	export let mode: Mode;
</script>

<div class="message">
	{#if mode === Mode.Initialise}
		Enter puzzle starting values in required cells.
	{:else if mode === Mode.EnterValue}
		Enter solution values in each cell. You can select and enter values in multiple cells.
	{:else}
		Enter multiple pencil marks into one or more selected cells.
	{/if}
	Entering a 0 or the same number will clear the cell.
</div>

<style>
	.message {
		margin: 1rem 0.5rem 0 0.5rem;
		text-align: center;
	}
</style>
