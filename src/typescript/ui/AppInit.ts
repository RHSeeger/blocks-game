// AppInit.ts
// ----------
// Handles UI initialization and DOM setup for the Blocks Game application.

import { setupGameComponent } from './GameComponent';

/**
 * Initializes the UI for the Blocks Game application.
 * Should be called after the game state is available on window.gameState.
 */
export function initializeUi() {
    setupGameComponent((window as any).gameState);
    // Additional UI setup can be added here if needed.
    /*
    window.addEventListener("DOMContentLoaded", () => {
        const boardContainer = document.getElementById("human-board");
        if (boardContainer) {
            createBoard(boardContainer);
        }
    });
    */
}
