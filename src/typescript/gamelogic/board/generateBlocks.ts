import type { Block } from '../../types/Block';
import { BLOCK_COLORS, BOARD_HEIGHT, BOARD_SIZE, BOARD_WIDTH } from '../../data/board';
import { PLUS1_BLOCK } from '../../data/augmentations';

/**
 * Generates the blocks for a new board.
 */

/**
 * Generates the blocks for a new board: every space gets a regular block with a random color, plus any special blocks
 * the player's Augmentations allow.
 *
 * @param augmentations - The internalNames of the Augmentations the player has unlocked
 * @returns The blocks for the new board
 */
export function generateBlocks(augmentations: readonly string[]): Block[] {
    const blocks: Block[] = Array.from({ length: BOARD_SIZE }, () => ({ color: getRandomColor() }));
    if (augmentations.includes(PLUS1_BLOCK)) {
        blocks[getRandomInteriorIndex()] = { color: null, special: 'plus1' };
    }
    return blocks;
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
 * Returns the index of a random space that is not on the edge of the board.
 *
 * @returns A random interior index
 */
function getRandomInteriorIndex(): number {
    const row = 1 + Math.floor(Math.random() * (BOARD_HEIGHT - 2));
    const column = 1 + Math.floor(Math.random() * (BOARD_WIDTH - 2));
    return row * BOARD_WIDTH + column;
}
