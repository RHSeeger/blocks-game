// Cube type
// ---------
// This file defines the Cube type, representing a single block on the board. It may have a color and an optional special property (e.g., 'plus1').

import { CubeView } from '../bridge/CubeView';

export class Cube implements CubeView {
    color: string | null; // null means blank
    special?: 'plus1' | undefined; // Optional: 'plus1' for +1 Block

    constructor(color: string | null = null, special: 'plus1' | undefined = undefined) {
        this.color = color;
        this.special = special;
    }

    getColor(): string | null {
        return this.color;
    }

    getSpecial(): 'plus1' | undefined {
        return this.special;
    }
}
