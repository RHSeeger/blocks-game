
/**
 * Cube type
 * ----------
 * This file defines the Cube class, representing a single block on the board.
 * A Cube is immutable: once created, its fields cannot be changed.
 * It may have a color and an optional special property (e.g., 'plus1').
 */

import { CubeView } from '../bridge/CubeView';

export class Cube implements CubeView {
    /**
     * The color of the cube. Null means blank. Immutable.
     */
    public readonly color: string | null;

    /**
     * The special property of the cube, if any. Immutable.
     */
    public readonly special?: 'plus1';

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
