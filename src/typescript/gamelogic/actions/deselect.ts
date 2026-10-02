import { getGameState } from '../gameStateStore';
import { publishGameState } from '../publishGameState';

/**
 * Game-logic entry point: the human player clicked away from their selection.
 */

/**
 * Clears the human player's selection. Does nothing if nothing is selected.
 */
export function deselect(): void {
    const gameState = getGameState();
    if (gameState.humanPlayer.selectedIndices.length === 0) return;
    gameState.humanPlayer.selectedIndices = [];
    publishGameState(gameState);
}
