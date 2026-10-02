import type { DerivedGameInfo } from '../types/DerivedGameInfo';
import type { GameState } from '../types/GameState';
import { isBoardFinished } from './board/moves';

/**
 * Calculates the values the UI needs that are derived from the game state (rather than stored in it).
 */

/**
 * Calculates the values the UI needs that are derived from the game state.
 *
 * @param gameState - The game state
 * @returns The derived values
 */
export function calculateDerivedGameInfo(gameState: GameState): DerivedGameInfo {
    return {
        boardFinished: {
            human: isBoardFinished(gameState.humanPlayer.board),
            computer: isBoardFinished(gameState.computerPlayer.board),
        },
    };
}
