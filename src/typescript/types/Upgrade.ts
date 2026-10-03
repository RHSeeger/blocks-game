import type { PlayerId } from './PlayerId';

/**
 * Defines the Upgrade type: the definition of something that can be bought, in levels, to improve a player.
 */

/**
 * The definition of an Upgrade. The list of all Upgrades is in data/upgrades.ts; each player's level for each Upgrade
 * is stored in that player's state.
 *
 * What it costs depends on its tier and who it's for (see getUpgradeCurrency):
 * - `everyday` Upgrades for the human cost Chips, and for the computer cost Coins
 * - `gameChanging` Upgrades cost Gems
 */
export type Upgrade = {
    /** Unique identifier. Used in the game state and saves, so it must never change */
    internalName: string;
    /** Name shown to the player (can change over time) */
    displayName: string;
    /** What each level does */
    description: string;
    /** Whether it is an everyday Upgrade or a game-changing one; decides which currency it costs */
    tier: 'everyday' | 'gameChanging';
    /** The players it can be bought for */
    players: readonly PlayerId[];
    /** The internalName of the Augmentation a player must have before it can be bought for them, if any */
    requiresAugmentation?: string;
    /** The cost of the first level */
    baseCost: number;
    /** Each level costs this many times the level before it */
    costScaling: number;
    /** The highest level it can be bought to, if there is a limit */
    maxLevel?: number;
    /** The highest level for each player, when it differs between them (used instead of maxLevel) */
    maxLevelByPlayer?: Readonly<Record<PlayerId, number>>;
};
