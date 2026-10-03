import type { GameState } from '../types/GameState';
import { SPECIAL_BLOCK_SPAWNS } from '../data/specialBlocks';
import { getUpgradeLevel } from './upgrades';

/**
 * Which special block to explain to the human player next, in a pop-up, once they can get it.
 *
 * Each kind of special block is explained when the human player unlocks its Augmentation. The bigger versions (a +2,
 * a big bomb) are explained when the human player first buys the Upgrade that makes them appear. Each is identified by
 * that Augmentation's or Upgrade's internalName.
 */

/**
 * Returns what can be explained, in the order they're explained: each special block's Augmentation, then each bigger
 * version's Upgrade.
 *
 * @param gameState - The game state
 * @returns The internalNames, with whether the human player has each (unlocked, or bought at least one level)
 */
function getExplainables(gameState: GameState): { name: string; has: boolean }[] {
    const human = gameState.humanPlayer;
    return [
        ...SPECIAL_BLOCK_SPAWNS.map((spawn) => ({
            name: spawn.augmentation,
            has: human.augmentations.includes(spawn.augmentation),
        })),
        ...SPECIAL_BLOCK_SPAWNS.flatMap((spawn) =>
            spawn.bigger === undefined
                ? []
                : [{ name: spawn.bigger.chanceUpgrade, has: getUpgradeLevel(human, spawn.bigger.chanceUpgrade) > 0 }],
        ),
    ];
}

/**
 * Returns the special block to explain now: the first one (see getExplainables) the human player has, but hasn't had
 * explained yet. Nothing is explained until the introduction has been seen, so the two pop-ups never show at once.
 *
 * @param gameState - The game state
 * @returns The internalName of its Augmentation (or, for a bigger version, its Upgrade), or undefined if there's
 *          nothing to explain now
 */
export function getSpecialBlockToExplain(gameState: GameState): string | undefined {
    if (!gameState.introSeen) return undefined;
    return getExplainables(gameState).find(({ name, has }) => has && !gameState.specialBlocksExplained.includes(name))
        ?.name;
}

/**
 * Records that a special block's explanation has been closed, so it isn't shown again.
 *
 * @param gameState - The game state (updated in place)
 * @param name - The internalName of its Augmentation (or, for a bigger version, its Upgrade)
 * @returns True if it was recorded; false if it was already explained, or isn't a special block
 */
export function markSpecialBlockExplained(gameState: GameState, name: string): boolean {
    const known = getExplainables(gameState).some((explainable) => explainable.name === name);
    if (!known || gameState.specialBlocksExplained.includes(name)) return false;
    gameState.specialBlocksExplained.push(name);
    return true;
}
