import type { Block } from '../../src/typescript/types/Block';
import type { Board } from '../../src/typescript/types/Board';
import type { GameState } from '../../src/typescript/types/GameState';

/**
 * Helpers for building boards and game states in tests.
 */

/** Size of the boards these helpers build, unless one is given */
export const TEST_BOARD_SIZE = 10;

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
 * Creates a board of empty spaces, with the given blocks placed at the given indices.
 *
 * @param placements - Blocks to place, by index
 * @param width - The number of columns (default 10)
 * @param height - The number of rows (default 10)
 * @returns The board
 */
export function boardWith(
    placements: Record<number, Block> = {},
    width = TEST_BOARD_SIZE,
    height = TEST_BOARD_SIZE,
): Board {
    const blocks: Block[] = Array.from({ length: width * height }, () => ({ color: null }));
    Object.entries(placements).forEach(([index, block]) => {
        blocks[Number(index)] = block;
    });
    return { width, height, blocks };
}

/**
 * Creates a 10x10 board whose first row is the given blocks, and the rest empty.
 *
 * @param row - The blocks for the first row (up to 10)
 * @returns The board
 */
export function boardWithFirstRow(row: Block[]): Board {
    return boardWith(Object.fromEntries(row.map((block, index) => [index, block])));
}

/**
 * Creates a game state with the given boards and everything else at its starting value.
 *
 * @param humanBoard - The human player's board
 * @param computerBoard - The computer player's board
 * @returns The game state
 */
export function makeGameState(humanBoard: Board = boardWith(), computerBoard: Board = boardWith()): GameState {
    const player = (board: Board) => ({
        board,
        totalScore: 0,
        boardScore: 0,
        maxBoardScore: 0,
        boardNumber: 1,
        selectedIndices: [],
        augmentations: [],
    });
    return {
        humanPlayer: player(humanBoard),
        computerPlayer: player(computerBoard),
        accomplishedAchievements: [],
        gameStats: { largestGroup: 0, groupSizeCounts: {} },
    };
}

/**
 * Returns the colors of one row of a board.
 *
 * @param board - The board
 * @param row - The row number
 * @returns The colors in that row (null for empty spaces and special blocks)
 */
export function rowColors(board: Board, row: number): (string | null)[] {
    return board.blocks.slice(row * board.width, (row + 1) * board.width).map((block) => block.color);
}
