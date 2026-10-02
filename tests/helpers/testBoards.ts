import type { Block } from '../../src/typescript/types/Block';
import type { GameState } from '../../src/typescript/types/GameState';
import { BOARD_SIZE } from '../../src/typescript/data/board';

/**
 * Helpers for building boards and game states in tests.
 */

/**
 * Creates a regular block of the given color.
 *
 * @param color - The block's color
 * @returns The block
 */
export function regular(color: string): Block {
    return { color };
}

/**
 * Creates a "+1" special block.
 *
 * @returns The block
 */
export function plus1(): Block {
    return { color: null, special: 'plus1' };
}

/**
 * Creates a full board of empty spaces, with the given blocks placed at the given indices.
 *
 * @param placements - Blocks to place, by index
 * @returns The board's blocks
 */
export function boardWith(placements: Record<number, Block> = {}): Block[] {
    const blocks: Block[] = Array.from({ length: BOARD_SIZE }, () => ({ color: null }));
    Object.entries(placements).forEach(([index, block]) => {
        blocks[Number(index)] = block;
    });
    return blocks;
}

/**
 * Creates a full board whose first row is the given blocks, and the rest empty.
 *
 * @param row - The blocks for the first row (up to 10)
 * @returns The board's blocks
 */
export function boardWithFirstRow(row: Block[]): Block[] {
    const blocks = boardWith();
    row.forEach((block, index) => {
        blocks[index] = block;
    });
    return blocks;
}

/**
 * Creates a game state with the given boards and everything else at its starting value.
 *
 * @param humanBlocks - The human player's board
 * @param computerBlocks - The computer player's board
 * @returns The game state
 */
export function makeGameState(humanBlocks: Block[] = boardWith(), computerBlocks: Block[] = boardWith()): GameState {
    const player = (blocks: Block[]) => ({
        board: { blocks },
        totalScore: 0,
        boardScore: 0,
        maxBoardScore: 0,
        boardNumber: 1,
        selectedIndices: [],
        augmentations: [],
    });
    return {
        humanPlayer: player(humanBlocks),
        computerPlayer: player(computerBlocks),
        accomplishedAchievements: [],
        gameStats: { largestGroup: 0, groupSizeCounts: {} },
    };
}

/**
 * Returns the colors of one row of a board.
 *
 * @param blocks - The board's blocks
 * @param row - The row number
 * @returns The colors in that row (null for empty spaces and special blocks)
 */
export function rowColors(blocks: readonly Block[], row: number): (string | null)[] {
    return blocks.slice(row * 10, row * 10 + 10).map((block) => block.color);
}
