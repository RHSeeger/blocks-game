import type { GameState } from '../types/GameState';
import { getValidMoves, isBoardFinished } from './board/moves';
import { advanceToNextBoard } from './advanceToNextBoard';
import { applyBlockClick } from './applyBlockClick';

/**
 * The computer player's behavior.
 */

/**
 * Takes one turn for the computer player. Each turn does one thing:
 * - If a group is selected, remove it
 * - Otherwise, if the board is finished, move on to the next board
 * - Otherwise, select a random valid move
 *
 * @param gameState - The game state (updated in place)
 */
export function takeComputerTurn(gameState: GameState): void {
    const computer = gameState.computerPlayer;
    if (computer.selectedIndices.length > 0) {
        applyBlockClick(gameState, 'computer', computer.selectedIndices[0]);
    } else if (isBoardFinished(computer.board.blocks)) {
        advanceToNextBoard(computer);
    } else {
        const validMoves = getValidMoves(computer.board.blocks);
        const choice = validMoves[Math.floor(Math.random() * validMoves.length)];
        applyBlockClick(gameState, 'computer', choice);
    }
}
