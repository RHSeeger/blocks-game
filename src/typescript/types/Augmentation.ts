import type { PlayerId } from './PlayerId';

/**
 * Defines the Augmentation type: the definition of a feature that can be unlocked, such as a new special block.
 */

/**
 * The definition of an Augmentation. The list of all Augmentations is in data/augmentations.ts; which ones each player
 * has unlocked is stored in that player's state.
 */
export type Augmentation = {
    /** Unique identifier. Used in the game state and saves, so it must never change */
    internalName: string;
    /** Name shown to the player (can change over time) */
    displayName: string;
    /** What the Augmentation does */
    description: string;
    /** The players it can be unlocked for (some only make sense for one player, such as Greedy for the computer) */
    players: readonly PlayerId[];
};
