import type { PlayerId } from './PlayerId';
import type { UpgradeOffer } from './UpgradeOffer';

/**
 * Defines DerivedGameInfo: values calculated from the game state that the UI needs.
 */

/**
 * Values calculated from the game state that the UI needs. These are calculated by game logic each time the state
 * changes, rather than stored in the game state, so they can never be out of date.
 */
export type DerivedGameInfo = {
    /** Whether each player's board is finished (no valid moves left) */
    boardFinished: Record<PlayerId, boolean>;
    /** Every Upgrade for each player: its level, what the next level costs, and whether it can be bought now */
    upgradeOffers: UpgradeOffer[];
    /** The computer player's board that earns a Gem when it is finished (its next milestone) */
    nextComputerMilestoneBoard: number;
    /**
     * The special block Augmentation to explain in a pop-up now (its internalName), or undefined if there's none to
     * explain: one the human player has unlocked but hasn't had explained yet (see getSpecialBlockToExplain)
     */
    specialBlockToExplain: string | undefined;
};
