import type { PlayerId } from '../types/PlayerId';
import type { ReadonlyPlayerState } from '../types/ReadonlyPlayerState';
import { renderBoard } from './BoardComponent';
import { getElement } from './getElement';

/**
 * Draws one player's area on the Main tab: their scores, their board, and (for the human player) the Next Board button.
 */

/**
 * Draws one player's area. Element ids in the page are prefixed with the player's id (e.g. `human-score`).
 *
 * @param player - Which player
 * @param playerState - The player's state (read-only)
 * @param boardFinished - Whether the player's board is finished
 */
export function renderPlayerArea(player: PlayerId, playerState: ReadonlyPlayerState, boardFinished: boolean): void {
    getElement(`${player}-score`).textContent = String(playerState.totalScore);
    getElement(`${player}-board-score`).textContent = String(playerState.boardScore);
    getElement(`${player}-board-number`).textContent = String(playerState.boardNumber);
    getElement(`${player}-max-board-score`).textContent = String(playerState.maxBoardScore);

    const boardElement = getElement(`${player}-board`);
    renderBoard(boardElement, playerState);
    boardElement.classList.toggle('inactive', boardFinished);

    if (player === 'human') {
        getElement('next-board-btn').hidden = !boardFinished;
    }
}
