import type { Block } from '../../types/Block';
import type { Board } from '../../types/Board';
import { BLOCK_COLORS } from '../../data/board';
import { PLUS1_BLOCK } from '../../data/augmentations';

/**
 * Generates the blocks for a new board.
 */

/**
 * Generates a new board of the given size: every space gets a regular block with a random color, plus any special
 * blocks the player's Augmentations allow.
 *
 * @param width - The number of columns
 * @param height - The number of rows
 * @param augmentations - The internalNames of the Augmentations the player has unlocked
 * @returns The new board
 */
export function generateBoard(width: number, height: number, augmentations: readonly string[]): Board {
    const blocks: Block[] = Array.from({ length: width * height }, () => ({ color: getRandomColor() }));
    if (augmentations.includes(PLUS1_BLOCK)) {
        blocks[getRandomInteriorIndex(width, height)] = { color: null, special: 'plus1' };
    }
    return { width, height, blocks };
}

/**
 * Returns a random color for a regular block.
 *
 * @returns One of BLOCK_COLORS
 */
function getRandomColor(): string {
    return BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)];
}

/**
 * Returns the index of a random space that is not on the edge of the board (or any space, if the board is too small to
 * have an interior).
 *
 * @param width - The number of columns
 * @param height - The number of rows
 * @returns A random interior index
 */
function getRandomInteriorIndex(width: number, height: number): number {
    const randomInRange = (size: number) =>
        size > 2 ? 1 + Math.floor(Math.random() * (size - 2)) : Math.floor(Math.random() * size);
    return randomInRange(height) * width + randomInRange(width);
}
