/**
 * Additions to global types.
 */

interface Window {
    /**
     * Alias for the game state, for reading and changing it from the browser console (debugging, cheating, etc).
     * Set up by exposeGameStateOnWindow() in gamelogic/gameStateStore.ts. No code reads this.
     */
    gameState: import('./types/GameState').GameState;
}

declare module '*.css';
