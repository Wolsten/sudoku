import { writable } from 'svelte/store';

import type { Cell } from './types';

const emptyGrid: Cell[][] = [];

export const savedGrid = writable(emptyGrid);

