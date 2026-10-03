import type { GameState } from '../types/GameState';
import { SPECIAL_BLOCK_SPAWNS } from '../data/specialBlocks';

/**
 * Which special block to explain to the human player next, in a pop-up, after they unlock it.
 */

/**
 * Returns the special block Augmentation to explain now: the first one (in the order of SPECIAL_BLOCK_SPAWNS) the
 * human player has unlocked, but hasn't had explained yet. Nothing is explained until the introduction has been seen,
 * so the two pop-ups never show at once.
 *
 * @param gameState - The game state
 * @returns The Augmentation's internalName, or undefined if there's nothing to explain now
 */
export function getSpecialBlockToExplain(gameState: GameState): string | undefined {
    if (!gameState.introSeen) return undefined;
    const unlocked = gameState.humanPlayer.augmentations;
    return SPECIAL_BLOCK_SPAWNS.map((spawn) => spawn.augmentation).find(
        (augmentation) => unlocked.includes(augmentation) && !gameState.specialBlocksExplained.includes(augmentation),
    );
}

/**
 * Records that a special block's explanation has been closed, so it isn't shown again.
 *
 * @param gameState - The game state (updated in place)
 * @param augmentation - The special block Augmentation's internalName
 * @returns True if it was recorded; false if it was already explained, or isn't a special block
 */
export function markSpecialBlockExplained(gameState: GameState, augmentation: string): boolean {
    const isSpecialBlock = SPECIAL_BLOCK_SPAWNS.some((spawn) => spawn.augmentation === augmentation);
    if (!isSpecialBlock || gameState.specialBlocksExplained.includes(augmentation)) return false;
    gameState.specialBlocksExplained.push(augmentation);
    return true;
}
