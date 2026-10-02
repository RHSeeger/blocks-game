import type { Block } from '../../types/Block';
import type { DeepReadonly } from '../../types/DeepReadonly';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../../data/board';

/**
 * Small helpers for working with blocks and their positions on a board.
 */

/**
 * Creates an empty space (no color, not special).
 *
 * @returns A new empty block
 */
export function createEmptyBlock(): Block {
    return { color: null };
}

/**
 * Determines whether a block is an empty space (no color, not special).
 *
 * @param block - The block to check
 * @returns True if the block is an empty space
 */
export function isEmptyBlock(block: DeepReadonly<Block>): boolean {
    return block.color === null && block.special === undefined;
}

/**
 * Returns the indices of the spaces directly above, below, left and right of the given index.
 * Does not wrap around the edges of the board.
 *
 * @param index - The index of a space on the board
 * @returns The indices of its neighbors
 */
export function getNeighborIndices(index: number): number[] {
    const row = Math.floor(index / BOARD_WIDTH);
    const column = index % BOARD_WIDTH;
    const neighbors: number[] = [];
    if (row > 0) neighbors.push(index - BOARD_WIDTH);
    if (row < BOARD_HEIGHT - 1) neighbors.push(index + BOARD_WIDTH);
    if (column > 0) neighbors.push(index - 1);
    if (column < BOARD_WIDTH - 1) neighbors.push(index + 1);
    return neighbors;
}
