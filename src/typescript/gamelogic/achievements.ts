import type { Block } from '../types/Block';
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
 */
export function checkAchievementsAfterRemoval(
    gameState: GameState,
    player: PlayerId,
    sameColorGroupSize: number,
    removedBlocks: readonly Block[],
): void {
    if (player !== 'human') return;
    const human = getPlayerState(gameState, player);
    const touchedPlus1 = removedBlocks.some((block) => block.special === 'plus1');
    const regularBlocksRemoved = removedBlocks.filter((block) => block.special === undefined).length;

    if (sameColorGroupSize === 2 && touchedPlus1) awardAchievement(gameState, NO_NOT_LIKE_THAT);
    if (regularBlocksRemoved >= BIG_GROUP_SIZE) awardAchievement(gameState, GROUP_20);
    if (human.totalScore >= SCORE_GOAL) awardAchievement(gameState, SCORE_1000);
    if (isBoardFinished(human.board.blocks)) awardAchievement(gameState, FIRST_CLEAR);
}

/**
 * Marks an achievement as accomplished (if it isn't already), and unlocks its Augmentation for the player it names.
 *
 * @param gameState - The game state (updated in place)
 * @param internalName - The internalName of the achievement
 */
function awardAchievement(gameState: GameState, internalName: string): void {
    if (gameState.accomplishedAchievements.includes(internalName)) return;
    gameState.accomplishedAchievements.push(internalName);

    const unlocks = ALL_ACHIEVEMENTS.find((achievement) => achievement.internalName === internalName)?.unlocks;
    if (unlocks === undefined) return;
    const playerState = getPlayerState(gameState, unlocks.player);
    if (!playerState.augmentations.includes(unlocks.augmentation)) {
        playerState.augmentations.push(unlocks.augmentation);
    }
}
