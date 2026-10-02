import type { PlayerId } from './PlayerId';

/**
 * Defines the AugmentationUnlock type: which Augmentation an achievement unlocks, and for which player.
 */

/**
 * Which Augmentation an achievement unlocks, and for which player.
 */
export type AugmentationUnlock = {
    /** The internalName of the Augmentation */
    augmentation: string;
    /** The player it is unlocked for */
    player: PlayerId;
};
