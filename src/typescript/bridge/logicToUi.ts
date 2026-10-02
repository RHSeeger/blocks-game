import type { DerivedGameInfo } from '../types/DerivedGameInfo';
import type { ReadonlyGameState } from '../types/ReadonlyGameState';
import { renderGame } from '../ui/renderGame';

/**
 * Bridge: Game Logic → UI.
 *
 * The one function game logic calls when the game state has changed. It passes the read-only state to the UI to be
 * drawn, and contains no logic of its own.
 */

/**
 * The game state has changed; update the display.
 *
 * @param gameState - The current game state, read-only
 * @param derived - Values calculated from the game state that the UI needs
 */
export function gameStateChanged(gameState: ReadonlyGameState, derived: DerivedGameInfo): void {
    renderGame(gameState, derived);
}
