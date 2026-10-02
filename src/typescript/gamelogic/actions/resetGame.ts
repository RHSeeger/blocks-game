import { createInitialGameState } from '../createInitialGameState';
import { setGameState } from '../gameStateStore';
import { publishGameState } from '../publishGameState';

/**
 * Game-logic entry point: the user asked to reset the whole game.
 */

/**
 * Replaces the game state with a brand new game, erasing all progress.
 */
export function resetGame(): void {
    const gameState = createInitialGameState();
    setGameState(gameState);
    publishGameState(gameState);
}
