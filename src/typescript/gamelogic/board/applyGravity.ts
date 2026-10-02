import type { Block } from '../../types/Block';
import type { Board } from '../../types/Board';
import { createEmptyBlock, isEmptyBlock } from './blocks';

/**
 * Settles a board after blocks are removed (see design/game-design.md, "Board Behavior").
 */

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
    const { width, height } = board;
    return {
        width,
        height,
        blocks: dropDown(width, height, slideLeft(width, height, dropDown(width, height, board.blocks))),
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
function dropDown(width: number, height: number, blocks: readonly Block[]): Block[] {
    const result: Block[] = blocks.map(createEmptyBlock);
    for (let column = 0; column < width; column++) {
        const columnBlocks = rowIndices(height).map((row) => blocks[row * width + column]);
        const filled = columnBlocks.filter((block) => !isEmptyBlock(block));
        const firstFilledRow = height - filled.length;
        filled.forEach((block, i) => {
            result[(firstFilledRow + i) * width + column] = block;
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
function slideLeft(width: number, height: number, blocks: readonly Block[]): Block[] {
    const result: Block[] = blocks.map(createEmptyBlock);
    for (const row of rowIndices(height)) {
        const rowBlocks = blocks.slice(row * width, (row + 1) * width);
        const filled = rowBlocks.filter((block) => !isEmptyBlock(block));
        filled.forEach((block, column) => {
            result[row * width + column] = block;
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
