import type { PlayerState } from '../types/PlayerState';
import { generateBoard } from './board/generateBlocks';

/**
 * Moves a player on to a new board.
 */

/**
 * Moves a player on to a new board: generates new blocks (the same size as their current board, using the player's
 * Augmentations), resets the board score,
 * clears the selection, and increases the board number.
 *
 * @param playerState - The player's state (updated in place)
 */
export function advanceToNextBoard(playerState: PlayerState): void {
    const { width, height } = playerState.board;
    playerState.board = generateBoard(width, height, playerState.augmentations);
    playerState.boardScore = 0;
    playerState.boardNumber += 1;
    playerState.selectedIndices = [];
}
