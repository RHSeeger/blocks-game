import type { Block } from '../../types/Block';
import type { Board } from '../../types/Board';
import type { DeepReadonly } from '../../types/DeepReadonly';

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
 * @param board - The board (only its size is used)
 * @param index - The index of a space on the board
 * @returns The indices of its neighbors
 */
export function getNeighborIndices(board: DeepReadonly<Board>, index: number): number[] {
    const { width, height } = board;
    const row = Math.floor(index / width);
    const column = index % width;
    const neighbors: number[] = [];
    if (row > 0) neighbors.push(index - width);
    if (row < height - 1) neighbors.push(index + width);
    if (column > 0) neighbors.push(index - 1);
    if (column < width - 1) neighbors.push(index + 1);
    return neighbors;
}
