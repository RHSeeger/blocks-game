import type { GameState } from '../types/GameState';

/**
 * Owns the game state (see design/code-design.md, "Game State").
 *
 * This holds the one module-level variable in the codebase: the current game state. Game-logic entry points read it
 * with getGameState(); everything they call has the state passed in.
 *
 * window.gameState is a getter/setter alias onto this store, so the state can be read and changed from the browser
 * console. No code reads window.gameState.
 */

let currentGameState: GameState | null = null;

/**
 * Returns the current game state.
 *
 * @returns The current game state
 * @throws If the game state has not been set yet
 */
export function getGameState(): GameState {
    if (currentGameState === null) {
        throw new Error('The game state has not been set up yet');
    }
    return currentGameState;
}

/**
 * Replaces the current game state.
 *
 * @param gameState - The new game state
 */
export function setGameState(gameState: GameState): void {
    currentGameState = gameState;
}

/**
 * Makes window.gameState an alias for the game state in this store, so it can be read and changed from the browser
 * console. Both changing a field and replacing the whole object are seen by the next game-logic call.
 */
export function exposeGameStateOnWindow(): void {
    Object.defineProperty(window, 'gameState', {
        get: getGameState,
        set: setGameState,
        configurable: true,
    });
}
