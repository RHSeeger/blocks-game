import type { PlayerState } from '../types/PlayerState';
import { createNewBoard } from './createNewBoard';

/**
 * Moves a player on to a new board.
 */

/**
 * Moves a player on to a new board: creates a new board (using the player's Augmentations and Upgrades), resets the
 * board score,
 * clears the selection, and increases the board number.
 *
 * @param playerState - The player's state (updated in place)
 */
export function advanceToNextBoard(playerState: PlayerState): void {
    playerState.board = createNewBoard(playerState);
    playerState.boardScore = 0;
    playerState.boardNumber += 1;
    playerState.selectedIndices = [];
}
