import { createNewBoard } from '../createNewBoard';
import { getGameState } from '../gameStateStore';
import { publishGameState } from '../publishGameState';

/**
 * Game-logic entry point: the user asked to reset the human player's board.
 */

/**
 * Gives the human player a fresh copy of their current board: new blocks, board score back to 0, selection cleared.
 * The board number and total score are not changed.
 */
export function resetHumanBoard(): void {
    const gameState = getGameState();
    const human = gameState.humanPlayer;
    human.board = createNewBoard(human);
    human.boardScore = 0;
    human.selectedIndices = [];
    publishGameState(gameState);
}
