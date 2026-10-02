import type { Block } from '../types/Block';
import type { GameNotification } from '../types/GameNotification';
import type { GameState } from '../types/GameState';
import type { PlayerId } from '../types/PlayerId';
import { ALL_ACHIEVEMENTS, FIRST_CLEAR, GROUP_20, NO_NOT_LIKE_THAT, SCORE_1000 } from '../data/achievements';
import { isBoardFinished } from './board/moves';
import { getPlayerState } from './getPlayerState';

/**
 * Checks for, and awards, achievements. Awarding an achievement also unlocks its Augmentation, if it has one.
 * Achievements are only earned by the human player.
 */

const BIG_GROUP_SIZE = 20;
const SCORE_GOAL = 1000;

/**
 * Checks for achievements earned by removing a group of blocks, and awards them. Call this after the blocks have been
 * removed and the score updated.
 *
 * @param gameState - The game state (updated in place)
 * @param player - The player who removed the blocks
 * @param sameColorGroupSize - The size of the same-color group that was clicked (before special blocks applied)
 * @param removedBlocks - Every block that was removed
 * @returns Notifications for the achievements awarded and the Augmentations unlocked (empty if none)
 */
export function checkAchievementsAfterRemoval(
    gameState: GameState,
    player: PlayerId,
    sameColorGroupSize: number,
    removedBlocks: readonly Block[],
): GameNotification[] {
    if (player !== 'human') return [];
    const human = getPlayerState(gameState, player);
    const touchedPlus1 = removedBlocks.some((block) => block.special === 'plus1');
    const regularBlocksRemoved = removedBlocks.filter((block) => block.special === undefined).length;

    const earned = [
        sameColorGroupSize === 2 && touchedPlus1 ? NO_NOT_LIKE_THAT : undefined,
        regularBlocksRemoved >= BIG_GROUP_SIZE ? GROUP_20 : undefined,
        human.totalScore >= SCORE_GOAL ? SCORE_1000 : undefined,
        isBoardFinished(human.board.blocks) ? FIRST_CLEAR : undefined,
    ];
    return earned.flatMap((internalName) =>
        internalName === undefined ? [] : awardAchievement(gameState, internalName),
    );
}

/**
 * Marks an achievement as accomplished (if it isn't already), and unlocks its Augmentation for the player it names.
 *
 * @param gameState - The game state (updated in place)
 * @param internalName - The internalName of the achievement
 * @returns Notifications for what was newly awarded (empty if the achievement was already accomplished)
 */
function awardAchievement(gameState: GameState, internalName: string): GameNotification[] {
    if (gameState.accomplishedAchievements.includes(internalName)) return [];
    gameState.accomplishedAchievements.push(internalName);
    const notifications: GameNotification[] = [{ kind: 'achievement', achievement: internalName }];

    const unlocks = ALL_ACHIEVEMENTS.find((achievement) => achievement.internalName === internalName)?.unlocks;
    if (unlocks === undefined) return notifications;
    const playerState = getPlayerState(gameState, unlocks.player);
    if (playerState.augmentations.includes(unlocks.augmentation)) return notifications;
    playerState.augmentations.push(unlocks.augmentation);
    return [...notifications, { kind: 'augmentation', ...unlocks }];
}
