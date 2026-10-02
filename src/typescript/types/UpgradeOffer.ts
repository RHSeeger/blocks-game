import type { CurrencyId } from './CurrencyId';
import type { PlayerId } from './PlayerId';

/**
 * Defines the UpgradeOffer type: one Upgrade, for one player, as it can be bought right now.
 */

/**
 * One Upgrade, for one player, as it can be bought right now. Calculated by game logic from the game state and sent to
 * the UI (see DerivedGameInfo), so the UI doesn't need to know the rules for costs and requirements.
 */
export type UpgradeOffer = {
    /** The Upgrade's internalName */
    upgrade: string;
    /** The player it is for */
    player: PlayerId;
    /** The player's current level */
    level: number;
    /** What the current level does, in words (e.g. "125% chance") */
    effect: string;
    /** The currency the next level costs */
    currency: CurrencyId;
    /** The cost of the next level (undefined if it is already at its highest level) */
    cost?: number;
    /** The name of the Augmentation the player still needs before it can be bought, if any */
    requires?: string;
    /** Whether the next level can be bought right now (requirements met, not at the highest level, and affordable) */
    canBuy: boolean;
};
