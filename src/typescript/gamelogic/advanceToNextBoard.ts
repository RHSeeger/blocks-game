// advanceToNextBoard.ts
// Handles advancing the human player to the next board and updating game state.
import { getInitialCubes } from './BoardState';
import type { GameState } from '../GameState';

/**
 * Advances the human player to the next board, updating all relevant state.
 * @param gameState The current game state (mutated in place)
 */
export function advanceToNextBoard(gameState: GameState): void {
    const newCubes = getInitialCubes('player', gameState.unlockedUnlocks);
    gameState.humanPlayer.board = new (gameState.humanPlayer.board.constructor as any)(newCubes);
    gameState.humanPlayer.boardScore = 0;
    gameState.humanPlayer.boardNumber += 1;
    // Any other state updates can be added here
}
