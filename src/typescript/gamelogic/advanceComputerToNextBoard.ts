// advanceComputerToNextBoard.ts
// Handles advancing the computer player to the next board and updating game state.
import { getInitialCubes } from './BoardState';
import type { GameState } from '../GameState';

/**
 * Advances the computer player to the next board, updating all relevant state.
 * @param gameState The current game state (mutated in place)
 */
export function advanceComputerToNextBoard(gameState: GameState): void {
    const computer = gameState.computerPlayer;
    // Update maxBoardScore if current boardScore is greater
    if (computer.boardScore > computer.maxBoardScore) {
        computer.maxBoardScore = computer.boardScore;
    }
    const newCubes = getInitialCubes('computer', gameState.unlockedUnlocks);
    computer.board = new (computer.board.constructor as any)(newCubes);
    computer.boardScore = 0;
    computer.boardNumber += 1;
    // Any other state updates can be added here
}
