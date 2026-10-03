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
 * @param gemGoal - The player's next Gem goal: a board score for the human player, a board number for the computer
 *   player (the page's label says which)
 */
export function renderPlayerArea(
    player: PlayerId,
    playerState: ReadonlyPlayerState,
    boardFinished: boolean,
    gemGoal: number,
): void {
    getElement(`${player}-score`).textContent = String(playerState.totalScore);
    getElement(`${player}-board-score`).textContent = String(playerState.boardScore);
    getElement(`${player}-board-number`).textContent = String(playerState.boardNumber);
    getElement(`${player}-max-board-score`).textContent = String(playerState.maxBoardScore);
    getElement(`${player}-gem-goal`).textContent = String(gemGoal);

    const boardElement = getElement(`${player}-board`);
    renderBoard(boardElement, playerState);
    boardElement.classList.toggle('inactive', boardFinished);

    if (player === 'human') {
        getElement('next-board-btn').hidden = !boardFinished;
    }
}

/**
 * Shows, next to the human player's board score, what their selected group would score if removed (e.g. "+16"), or
 * hides it when nothing is selected.
 *
 * @param selectionScore - The selected group's score (from game logic), or undefined if nothing is selected
 */
export function renderSelectionScore(selectionScore: number | undefined): void {
    const preview = getElement('human-selection-score');
    preview.hidden = selectionScore === undefined;
    preview.textContent = selectionScore === undefined ? '' : `+${selectionScore}`;
}
