import type { GameStatistics } from '../types/GameStatistics';
import { TIDY_BLOCKS_LEFT } from '../data/achievements';

/**
 * Keeps the game statistics (shown on the Stats tab) up to date.
 */

/**
 * Records that the human player removed a group: updates the largest group, and the count of groups of that size.
 *
 * @param gameStats - The game statistics (updated in place)
 * @param size - The size of the group: the number of regular blocks removed, including any a +1 added
 */
export function recordGroupRemoved(gameStats: GameStatistics, size: number): void {
    gameStats.largestGroup = Math.max(gameStats.largestGroup, size);
    gameStats.groupSizeCounts[size] = (gameStats.groupSizeCounts[size] ?? 0) + 1;
}

/**
 * Records that the human player finished a board: updates the fewest blocks left, and counts it if it was tidy (see
 * TIDY_BLOCKS_LEFT, the same as the Tidy achievement) or spotless.
 *
 * @param gameStats - The game statistics (updated in place)
 * @param blocksLeft - How many blocks were left on the finished board (special blocks count)
 */
export function recordBoardFinished(gameStats: GameStatistics, blocksLeft: number): void {
    gameStats.fewestBlocksLeft = Math.min(gameStats.fewestBlocksLeft ?? blocksLeft, blocksLeft);
    if (blocksLeft <= TIDY_BLOCKS_LEFT) gameStats.tidyBoards += 1;
    if (blocksLeft === 0) gameStats.spotlessBoards += 1;
}
