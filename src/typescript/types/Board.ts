import type { Block } from './Block';

/**
 * Defines the Board type: the size of one player's board, and the blocks on it.
 */

/**
 * One player's board. Each player's board has its own size, so it can grow (e.g. with an Upgrade).
 * The blocks are stored row by row, top row first (index = row * width + column).
 */
export type Board = {
    /** Number of columns */
    width: number;
    /** Number of rows */
    height: number;
    /** The blocks, one per space (width * height of them) */
    blocks: Block[];
};
