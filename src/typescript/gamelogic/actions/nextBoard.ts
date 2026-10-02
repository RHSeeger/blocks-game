import { isBoardFinished } from '../board/moves';
import { advanceToNextBoard } from '../advanceToNextBoard';
import { getGameState } from '../gameStateStore';
import { publishGameState } from '../publishGameState';

/**
 * Game-logic entry point: the human player asked to move on to the next board.
 */

/**
 * Moves the human player on to the next board. Does nothing unless their current board is finished.
 */
export function nextBoard(): void {
    const gameState = getGameState();
    if (!isBoardFinished(gameState.humanPlayer.board)) return;
    advanceToNextBoard(gameState.humanPlayer);
    publishGameState(gameState);
}
