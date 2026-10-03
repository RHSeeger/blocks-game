import type { Block } from '../types/Block';
import type { GameNotification } from '../types/GameNotification';
import type { GameState } from '../types/GameState';
import type { PlayerId } from '../types/PlayerId';
import {
    ALL_ACHIEVEMENTS,
    BOMB_NOT_LIKE_THAT,
    CHAIN_REACTION,
    CLEARED_BOARD,
    EVERY_COLOR_LEFT,
    FIRST_CLEAR,
    GROUP_20,
    LINE_NOT_LIKE_THAT,
    NO_NOT_LIKE_THAT,
    REFILL_NOT_LIKE_THAT,
    SCORE_1000,
} from '../data/achievements';
import { BLOCK_COLORS } from '../data/board';
import { isEmptyBlock } from './board/blocks';
import { isBoardFinished } from './board/moves';
import { getPlayerState } from './getPlayerState';

/**
 * Checks for, and awards, achievements. Awarding an achievement also unlocks its Augmentation, if it has one.
 * Achievements are only earned by the human player.
 */

const BIG_GROUP_SIZE = 20;
const SCORE_GOAL = 2500;

/** How many special blocks one move must set off for Chain Reaction */
const CHAIN_REACTION_SPECIALS = 3;

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
    // A +2 is a bigger +1, and a big bomb a bigger bomb, so they count for the same achievements
    const touchedPlus1 = removedBlocks.some((block) => block.special === 'plus1' || block.special === 'plus2');
    const touchedLine = removedBlocks.some(
        (block) => block.special === 'lineHorizontal' || block.special === 'lineVertical',
    );
    const touchedBomb = removedBlocks.some((block) => block.special === 'bomb' || block.special === 'bigBomb');
    const touchedRefill = removedBlocks.some((block) => block.special === 'refill');
    const specialsSetOff = removedBlocks.filter((block) => block.special !== undefined).length;
    const regularBlocksRemoved = removedBlocks.filter((block) => block.special === undefined).length;

    const blocks = human.board.blocks;
    const boardFinished = isBoardFinished(human.board);

    const earned = [
        sameColorGroupSize === 2 && touchedPlus1 ? NO_NOT_LIKE_THAT : undefined,
        sameColorGroupSize === 2 && touchedLine ? LINE_NOT_LIKE_THAT : undefined,
        sameColorGroupSize === 2 && touchedBomb ? BOMB_NOT_LIKE_THAT : undefined,
        sameColorGroupSize === 2 && touchedRefill ? REFILL_NOT_LIKE_THAT : undefined,
        specialsSetOff >= CHAIN_REACTION_SPECIALS ? CHAIN_REACTION : undefined,
        regularBlocksRemoved >= BIG_GROUP_SIZE ? GROUP_20 : undefined,
        human.totalScore >= SCORE_GOAL ? SCORE_1000 : undefined,
        boardFinished ? FIRST_CLEAR : undefined,
        boardFinished && blocks.every(isEmptyBlock) ? CLEARED_BOARD : undefined,
        boardFinished && hasEveryColor(blocks) ? EVERY_COLOR_LEFT : undefined,
    ];
    return earned.flatMap((internalName) =>
        internalName === undefined ? [] : awardAchievement(gameState, internalName),
    );
}

/**
 * Determines whether a board has at least one block of every color on it.
 *
 * @param blocks - The blocks on the board
 * @returns True if every color in BLOCK_COLORS appears at least once
 */
function hasEveryColor(blocks: readonly Block[]): boolean {
    return BLOCK_COLORS.every((color) => blocks.some((block) => block.color === color));
}

/**
 * Marks an achievement as accomplished (if it isn't already), adds its Gems to the wallet, and unlocks its
 * Augmentation for the player it names.
 *
 * @param gameState - The game state (updated in place)
 * @param internalName - The internalName of the achievement
 * @returns Notifications for what was newly awarded (empty if the achievement was already accomplished)
 */
export function awardAchievement(gameState: GameState, internalName: string): GameNotification[] {
    if (gameState.accomplishedAchievements.includes(internalName)) return [];
    gameState.accomplishedAchievements.push(internalName);
    const notifications: GameNotification[] = [{ kind: 'achievement', achievement: internalName }];

    const definition = ALL_ACHIEVEMENTS.find((achievement) => achievement.internalName === internalName);
    gameState.wallet.gems += definition?.gems ?? 0;
    const unlocks = definition?.unlocks;
    if (unlocks === undefined) return notifications;
    const playerState = getPlayerState(gameState, unlocks.player);
    if (playerState.augmentations.includes(unlocks.augmentation)) return notifications;
    playerState.augmentations.push(unlocks.augmentation);
    return [...notifications, { kind: 'augmentation', ...unlocks }];
}
