export type Cell = {
    initialised: boolean;
    value: number;
    options: number[];
    colours: string[];
    dom?: HTMLElement;
    selected: boolean;
    paired: boolean;
    error: boolean;
};

export enum Mode {
    Initialise = 0,
    EnterValue = 1,
    PencilIn = 2
}

export enum SelectMode {
    Single = 0,
    Multiple = 1
}

export type SelectedCell = {
    row: number;
    col: number;
};