import { ALL_ACHIEVEMENTS } from '../../data/achievements';
import { awardAchievement } from '../achievements';
import { getGameState } from '../gameStateStore';
import { publishGameState } from '../publishGameState';

/**
 * Game-logic entry point: the user used the debug tools to grant themselves an achievement.
 */

/**
 * Grants an achievement as if it had just been accomplished: its Gems, its unlock, and the notifications for both.
 * Does nothing if the achievement doesn't exist or has already been accomplished. (A debug tool, for testing what an
 * achievement unlocks without having to earn it.)
 *
 * @param achievement - The achievement's internalName
 */
export function grantAchievement(achievement: string): void {
    if (!ALL_ACHIEVEMENTS.some((a) => a.internalName === achievement)) return;
    const gameState = getGameState();
    const notifications = awardAchievement(gameState, achievement);
    if (notifications.length === 0) return;
    publishGameState(gameState, notifications);
}
