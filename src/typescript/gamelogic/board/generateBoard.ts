import type { Block } from '../../types/Block';
import type { Board } from '../../types/Board';
import { BLOCK_COLORS } from '../../data/board';

/**
 * Generates the blocks for a new board.
 */

/**
 * Generates a new board of the given size: every space gets a regular block with a random color, then the given
 * number of +1 blocks replace blocks at random spaces away from the edges (each at a different space).
 *
 * @param width - The number of columns
 * @param height - The number of rows
 * @param plus1Count - How many +1 blocks to place (limited to the number of spaces available)
 * @returns The new board
 */
export function generateBoard(width: number, height: number, plus1Count: number): Board {
    const blocks: Block[] = Array.from({ length: width * height }, () => ({ color: getRandomColor() }));
    const candidates = getInteriorIndices(width, height);
    for (let i = 0; i < plus1Count && candidates.length > 0; i++) {
        const [index] = candidates.splice(Math.floor(Math.random() * candidates.length), 1);
        blocks[index] = { color: null, special: 'plus1' };
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
 * Returns the indices of every space that is not on the edge of the board (or every space, if the board is too small
 * to have any).
 *
 * @param width - The number of columns
 * @param height - The number of rows
 * @returns The interior indices
 */
function getInteriorIndices(width: number, height: number): number[] {
    const all = Array.from({ length: width * height }, (_, index) => index);
    const interior = all.filter((index) => {
        const row = Math.floor(index / width);
        const column = index % width;
        return row > 0 && row < height - 1 && column > 0 && column < width - 1;
    });
    return interior.length > 0 ? interior : all;
}
