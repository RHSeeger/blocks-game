// nextBoardBridge.ts
// Handles advancing to the next board when the UI emits the nextBoardRequested event.
import type { GameState } from '../GameState';
import { advanceToNextBoard } from '../gamelogic/advanceToNextBoard';
import { updateAllGameUi } from '../ui/updateAllGameUi';

// Listen for the custom event from the UI
window.addEventListener('nextBoardRequested', () => {
    // Get the current game state
    const gameState: GameState = (window as any).gameState;
    // Delegate all mutation to gamelogic
    advanceToNextBoard(gameState);
    // Notify UI to update
    updateAllGameUi();
});
