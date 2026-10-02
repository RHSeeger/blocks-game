import type { GameStatistics } from '../types/GameStatistics';

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
