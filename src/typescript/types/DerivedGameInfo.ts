import type { PlayerId } from './PlayerId';

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
};
