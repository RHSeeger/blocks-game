import type { Block } from '../../types/Block';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../../data/board';
import { createEmptyBlock, isEmptyBlock } from './blocks';

/**
 * Settles a board after blocks are removed (see design/game-design.md, "Board Behavior").
 */

/**
 * Returns a new array of blocks with the board settled:
 * 1. Blocks fall down to fill gaps in each column
 * 2. Blocks in each row slide left to fill gaps in that row
 * 3. Blocks fall down again
 *
 * Blocks keep their order within each column/row. The input array is not changed.
 *
 * @param blocks - The blocks on the board
 * @returns The settled blocks
 */
export function applyGravity(blocks: readonly Block[]): Block[] {
    return dropDown(slideLeft(dropDown(blocks)));
}

/**
 * Moves every block in each column down to fill the gaps below it.
 *
 * @param blocks - The blocks on the board
 * @returns The new blocks
 */
function dropDown(blocks: readonly Block[]): Block[] {
    const result: Block[] = blocks.map(createEmptyBlock);
    for (let column = 0; column < BOARD_WIDTH; column++) {
        const columnBlocks = rowIndices().map((row) => blocks[row * BOARD_WIDTH + column]);
        const filled = columnBlocks.filter((block) => !isEmptyBlock(block));
        const firstFilledRow = BOARD_HEIGHT - filled.length;
        filled.forEach((block, i) => {
            result[(firstFilledRow + i) * BOARD_WIDTH + column] = block;
        });
    }
    return result;
}

/**
 * Moves every block in each row left to fill the gaps beside it.
 *
 * @param blocks - The blocks on the board
 * @returns The new blocks
 */
function slideLeft(blocks: readonly Block[]): Block[] {
    const result: Block[] = blocks.map(createEmptyBlock);
    for (const row of rowIndices()) {
        const rowBlocks = blocks.slice(row * BOARD_WIDTH, (row + 1) * BOARD_WIDTH);
        const filled = rowBlocks.filter((block) => !isEmptyBlock(block));
        filled.forEach((block, column) => {
            result[row * BOARD_WIDTH + column] = block;
        });
    }
    return result;
}

/**
 * Returns the row numbers of a board, top to bottom.
 *
 * @returns [0, 1, ..., BOARD_HEIGHT - 1]
 */
function rowIndices(): number[] {
    return Array.from({ length: BOARD_HEIGHT }, (_, row) => row);
}
