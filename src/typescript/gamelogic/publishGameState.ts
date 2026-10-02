import type { GameState } from '../types/GameState';
import { gameStateChanged } from '../bridge/logicToUi';
import { calculateDerivedGameInfo } from './calculateDerivedGameInfo';
import { saveGameState } from './persistence';

/**
 * The last step of every game-logic entry point: save the game state, then send it to the UI.
 */

/**
 * Saves the game state, then sends a read-only version of it (plus the derived values) through the bridge to the UI.
 * Every game-logic entry point calls this after changing the game state.
 *
 * @param gameState - The game state that was just changed
 */
export function publishGameState(gameState: GameState): void {
    saveGameState(gameState);
    gameStateChanged(gameState, calculateDerivedGameInfo(gameState));
}
