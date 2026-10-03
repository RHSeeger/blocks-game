import type { Block } from '../../types/Block';
import type { Board } from '../../types/Board';
import { createEmptyBlock, isEmptyBlock } from './blocks';

/**
 * Settles a board after blocks are removed (see design/game-design.md, "Board Behavior").
 */

/** A block, along with the index it started at before the board was settled (-1 for an empty space) */
type TrackedBlock = { block: Block; from: number };

/** An empty space, while settling */
const EMPTY: TrackedBlock = { block: createEmptyBlock(), from: -1 };

/**
 * Returns a new board, the same size, with the blocks settled:
 * 1. Blocks fall down to fill gaps in each column
 * 2. Blocks in each row slide left to fill gaps in that row
 * 3. Blocks fall down again
 *
 * Blocks keep their order within each column/row. The board passed in is not changed.
 *
 * @param board - The board
 * @returns The settled board
 */
export function applyGravity(board: Readonly<Board>): Board {
    return settleBoard(board).board;
}

/**
 * Settles a board (see applyGravity), and also works out where each block came from, so the move can be shown
 * (blocks sliding from their old spaces to their new ones).
 *
 * @param board - The board (not changed)
 * @returns The settled board, and `cameFrom`: for each space on the settled board, the index the block in it was at
 *          before settling (-1 for an empty space)
 */
export function settleBoard(board: Readonly<Board>): { board: Board; cameFrom: number[] } {
    const { width, height } = board;
    const tracked = board.blocks.map((block, index) => (isEmptyBlock(block) ? EMPTY : { block, from: index }));
    const settled = dropDown(width, height, slideLeft(width, height, dropDown(width, height, tracked)));
    return {
        board: { width, height, blocks: settled.map((t) => (t.from === -1 ? createEmptyBlock() : t.block)) },
        cameFrom: settled.map((t) => t.from),
    };
}

/**
 * Moves every block in each column down to fill the gaps below it.
 *
 * @param width - The number of columns
 * @param height - The number of rows
 * @param blocks - The blocks on the board
 * @returns The new blocks
 */
function dropDown(width: number, height: number, blocks: readonly TrackedBlock[]): TrackedBlock[] {
    const result = blocks.map(() => EMPTY);
    for (let column = 0; column < width; column++) {
        const columnBlocks = rowIndices(height).map((row) => blocks[row * width + column]);
        const filled = columnBlocks.filter((t) => t.from !== -1);
        const firstFilledRow = height - filled.length;
        filled.forEach((t, i) => {
            result[(firstFilledRow + i) * width + column] = t;
        });
    }
    return result;
}

/**
 * Moves every block in each row left to fill the gaps beside it.
 *
 * @param width - The number of columns
 * @param height - The number of rows
 * @param blocks - The blocks on the board
 * @returns The new blocks
 */
function slideLeft(width: number, height: number, blocks: readonly TrackedBlock[]): TrackedBlock[] {
    const result = blocks.map(() => EMPTY);
    for (const row of rowIndices(height)) {
        const rowBlocks = blocks.slice(row * width, (row + 1) * width);
        const filled = rowBlocks.filter((t) => t.from !== -1);
        filled.forEach((t, column) => {
            result[row * width + column] = t;
        });
    }
    return result;
}

/**
 * Returns the row numbers of a board, top to bottom.
 *
 * @param height - The number of rows
 * @returns [0, 1, ..., height - 1]
 */
function rowIndices(height: number): number[] {
    return Array.from({ length: height }, (_, row) => row);
}
