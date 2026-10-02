import type { GameState } from '../types/GameState';
import type { PlayerId } from '../types/PlayerId';
import type { PlayerState } from '../types/PlayerState';

/**
 * Looks up one player's state in the game state.
 */

/**
 * Returns the state for the given player.
 *
 * @param gameState - The game state
 * @param player - Which player
 * @returns That player's state (the same object, not a copy)
 */
export function getPlayerState(gameState: GameState, player: PlayerId): PlayerState {
    return player === 'human' ? gameState.humanPlayer : gameState.computerPlayer;
}
