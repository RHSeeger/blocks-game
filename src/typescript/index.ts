import '../css/styles.css';
import '../css/next-board-btn.css';
import { refreshGame } from './gamelogic/actions/refreshGame';
import { createInitialGameState } from './gamelogic/createInitialGameState';
import { startGameLoop } from './gamelogic/gameLoop';
import { exposeGameStateOnWindow, setGameState } from './gamelogic/gameStateStore';
import { loadGameState } from './gamelogic/persistence';
import { initializeUi } from './ui/initializeUi';

/**
 * The entry point for the Blocks Game application. Starts the game once the page is ready
 * (see design/code-design.md, "Folder Layout").
 */

/**
 * Starts the game:
 * 1. Load the saved game state (or create a new game) and put it in the state store
 * 2. Make window.gameState available in the browser console
 * 3. Set up the UI's event handlers
 * 4. Draw the initial display
 * 5. Start the computer player's timer
 */
function startApplication(): void {
    setGameState(loadGameState() ?? createInitialGameState());
    exposeGameStateOnWindow();
    initializeUi();
    refreshGame();
    startGameLoop();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApplication);
} else {
    startApplication();
}
