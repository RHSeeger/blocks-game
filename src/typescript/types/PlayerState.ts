import type { Board } from './Board';

/**
 * Defines the PlayerState type: everything about one player (human or computer).
 */

/**
 * Everything about one player (human or computer). Each player has their own, separate PlayerState.
 */
export type PlayerState = {
    /** The player's current board */
    board: Board;
    /** Score earned across all boards */
    totalScore: number;
    /** Score earned on the current board */
    boardScore: number;
    /** The highest score earned on a single board */
    maxBoardScore: number;
    /** Which board the player is on (starts at 1) */
    boardNumber: number;
    /**
     * The indices of the currently selected blocks (empty if nothing is selected).
     * The first index is the block that was clicked to make the selection.
     */
    selectedIndices: number[];
    /** The internalNames of the Augmentations this player has unlocked */
    augmentations: string[];
    /** This player's level for each Upgrade they have bought (internalName -> level; missing means level 0) */
    upgradeLevels: Record<string, number>;
};
