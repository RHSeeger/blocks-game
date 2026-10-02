import type { Block } from '../types/Block';
import type { GameState } from '../types/GameState';
import type { PlayerId } from '../types/PlayerId';
import { NO_NOT_LIKE_THAT } from '../data/achievements';

/**
 * Checks for, and awards, achievements.
 */

/**
 * Checks for achievements earned by removing a group of blocks, and awards them.
 *
 * @param gameState - The game state (updated in place)
 * @param player - The player who removed the blocks
 * @param sameColorGroupSize - The size of the same-color group that was clicked (before special blocks applied)
 * @param removedBlocks - Every block that was removed
 */
export function checkAchievementsAfterRemoval(
    gameState: GameState,
    player: PlayerId,
    sameColorGroupSize: number,
    removedBlocks: readonly Block[],
): void {
    if (player !== 'human') return;
    const touchedPlus1 = removedBlocks.some((block) => block.special === 'plus1');
    if (sameColorGroupSize === 2 && touchedPlus1) {
        awardAchievement(gameState, NO_NOT_LIKE_THAT);
    }
}

/**
 * Marks an achievement as accomplished, if it isn't already.
 *
 * @param gameState - The game state (updated in place)
 * @param internalName - The internalName of the achievement
 */
function awardAchievement(gameState: GameState, internalName: string): void {
    if (!gameState.accomplishedAchievements.includes(internalName)) {
        gameState.accomplishedAchievements.push(internalName);
    }
}
