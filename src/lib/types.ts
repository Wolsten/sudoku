export type Cell = {
    initialised: boolean;
    value: number;
    options: number[];
    colours: number[];
    selected: boolean;
    locked: boolean;
    error: boolean;
    crosshair: boolean;
};

export enum Mode {
    Initialise = 1,
    EnterValue = 2,
    PencilIn = 3
}

export enum SelectMode {
    Single = 1,
    Multiple = 2,
    Clear = 3
}

export type SelectedCell = {
    row: number;
    col: number;
}