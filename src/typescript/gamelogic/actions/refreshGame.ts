import { getGameState } from '../gameStateStore';
import { publishGameState } from '../publishGameState';

/**
 * Game-logic entry point: show the current game state without changing it.
 */

/**
 * Saves and displays the current game state without changing it. Used at startup to draw the initial display.
 */
export function refreshGame(): void {
    publishGameState(getGameState());
}
