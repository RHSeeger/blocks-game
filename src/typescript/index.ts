import '../css/styles.css';
import { createInitialGameState, loadGameStateFromStorage } from './initialization';
import { setupGameComponent } from './ui/GameComponent';

// --- GameState Initialization ---
const loadedState = loadGameStateFromStorage();
const gameState = loadedState ?? createInitialGameState();

// --- UI Setup ---
setupGameComponent(gameState);

// This is where the code that sets up the game lives... calls to initialize the game, load assets, etc.

/* window.addEventListener("DOMContentLoaded", () => {
    const boardContainer = document.getElementById("human-board");
    if (boardContainer) {
        createBoard(boardContainer);
    }
});
 */
