import type { AugmentationUnlock } from './AugmentationUnlock';

/**
 * Defines the Achievement type: the definition of something the player can accomplish.
 */

/**
 * The definition of an achievement. The list of all achievements is in data/achievements.ts; which ones have been
 * accomplished is stored in the game state.
 */
export type Achievement = {
    /** Unique identifier. Used in the game state and saves, so it must never change */
    internalName: string;
    /** Name shown to the player (can change over time) */
    displayName: string;
    /** What the achievement means, or how it is earned */
    description: string;
    /** The Augmentation this achievement unlocks, if any */
    unlocks?: AugmentationUnlock;
};
