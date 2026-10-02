import type { DerivedGameInfo } from '../types/DerivedGameInfo';
import type { GameNotification } from '../types/GameNotification';
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
 * @param notifications - Anything that just happened that the player should be told about
 */
export function gameStateChanged(
    gameState: ReadonlyGameState,
    derived: DerivedGameInfo,
    notifications: readonly GameNotification[],
): void {
    renderGame(gameState, derived, notifications);
}
