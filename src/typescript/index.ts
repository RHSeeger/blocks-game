import '../css/styles.css';
import { createInitialGameState } from './initialization';
import { setupGameComponent } from './ui/GameComponent';

// --- GameState Initialization ---
const gameState = createInitialGameState();

// All DOM logic is now in UI components
// The main TypeScript entry point for the web app

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
