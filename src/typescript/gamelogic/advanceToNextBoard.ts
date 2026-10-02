import type { PlayerState } from '../types/PlayerState';
import { generateBlocks } from './board/generateBlocks';

/**
 * Moves a player on to a new board.
 */

/**
 * Moves a player on to a new board: generates new blocks (using the player's Augmentations), resets the board score,
 * clears the selection, and increases the board number.
 *
 * @param playerState - The player's state (updated in place)
 */
export function advanceToNextBoard(playerState: PlayerState): void {
    playerState.board = { blocks: generateBlocks(playerState.augmentations) };
    playerState.boardScore = 0;
    playerState.boardNumber += 1;
    playerState.selectedIndices = [];
}
