import type { Block } from './Block';

/**
 * Defines the Board type: the blocks on one player's board.
 */

/**
 * The blocks on one player's board, stored row by row (index = row * BOARD_WIDTH + column).
 */
export type Board = {
    blocks: Block[];
};
