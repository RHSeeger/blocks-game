import type { GameNotification } from '../types/GameNotification';
import type { GameState } from '../types/GameState';
import { advanceToNextBoard } from './advanceToNextBoard';
import { applyBlockClick } from './applyBlockClick';
import { chooseComputerMove } from './chooseComputerMove';

/**
 * The computer player's behavior.
 */

/**
 * Takes one turn for the computer player. Each turn does one thing:
 * - If a group is selected, remove it
 * - Otherwise, if the board is finished, move on to the next board
 * - Otherwise, select a move (see chooseComputerMove)
 *
 * @param gameState - The game state (updated in place)
 * @returns Notifications for anything the turn awarded (empty if none)
 */
export function takeComputerTurn(gameState: GameState): GameNotification[] {
    const computer = gameState.computerPlayer;
    if (computer.selectedIndices.length > 0) {
        return applyBlockClick(gameState, 'computer', computer.selectedIndices[0]);
    }
    const choice = chooseComputerMove(computer);
    if (choice === undefined) {
        advanceToNextBoard(computer, 'computer');
        return [];
    }
    return applyBlockClick(gameState, 'computer', choice);
}
