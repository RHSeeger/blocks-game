import { handleCubeClick } from './boardInteractions';
// Removed unused saveGameState import
import { updateAllGameUi } from '../ui/updateAllGameUi';

/**
 * Called by the UI when a cube is clicked. Handles all game logic, state changes, saving, and UI updates.
 */
export function onCubeClicked(cubeIndex: number, player: 'human' | 'computer', board: HTMLElement) {
    handleCubeClick(cubeIndex, player);
    updateAllGameUi(player);
}

/**
 * Called by the UI when a click outside the board occurs (to unselect).
 */
export function onUnselect() {
    // Unselect logic removed; handled by game state update elsewhere
}
