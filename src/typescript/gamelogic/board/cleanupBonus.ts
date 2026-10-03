import type { Board } from '../../types/Board';
import type { DeepReadonly } from '../../types/DeepReadonly';
import { BLOCK_COLORS, CLEANUP_BONUS_FULL_CLEAR_PERCENT, CLEANUP_BONUS_PERCENT_PER_BLOCK } from '../../data/board';
import { isEmptyBlock } from './blocks';

/**
 * The clean-up bonus: a reward, at the end of a board, for leaving few blocks on it.
 */

/**
 * Returns the clean-up bonus, in percent of the board score, for a finished board with the given number of blocks left
 * (special blocks count too). It starts once no more blocks are left than there are colors, and goes up a step for
 * each block fewer, plus an extra amount for clearing the board completely. With 5 colors: 5 left is +5%, 4 is +10%,
 * 3 is +15%, 2 is +20%, 1 is +25%, and none is +30% plus 20%, so +50%. With more colors (a harder board to clear),
 * it starts at more blocks left and is worth more.
 *
 * @param blocksLeft - The number of blocks left on the finished board
 * @param colorCount - The number of block colors in play (default: all of them)
 * @returns The bonus, in percent (0 if too many blocks are left)
 */
export function getCleanupBonusPercent(blocksLeft: number, colorCount: number = BLOCK_COLORS.length): number {
    if (blocksLeft > colorCount) return 0;
    const steps = colorCount - blocksLeft + 1;
    return steps * CLEANUP_BONUS_PERCENT_PER_BLOCK + (blocksLeft === 0 ? CLEANUP_BONUS_FULL_CLEAR_PERCENT : 0);
}

/**
 * Works out the clean-up bonus for a finished board: its percent (see getCleanupBonusPercent) of the board score.
 *
 * @param board - The finished board
 * @param boardScore - The score earned on the board so far
 * @returns How many blocks are left, the bonus's percent, and the points it adds (rounded)
 */
export function getCleanupBonus(
    board: DeepReadonly<Board>,
    boardScore: number,
): { blocksLeft: number; percent: number; points: number } {
    const blocksLeft = board.blocks.filter((block) => !isEmptyBlock(block)).length;
    const percent = getCleanupBonusPercent(blocksLeft);
    return { blocksLeft, percent, points: Math.round((boardScore * percent) / 100) };
}
