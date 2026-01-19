import { handleCubeClick } from './boardInteractions';
// Removed unused saveGameState import
import { updatePlayerComponent } from '../ui/PlayerComponent';

/**
 * Called by the UI when a cube is clicked. Handles all game logic, state changes, saving, and UI updates.
 */
/**
 * Called by the UI when a cube is clicked. Handles all game logic, state changes, saving, and UI updates.
export function onUnselect() {
 */
export function onCubeClicked(cubeIndex: number, player: 'human' | 'computer', board: HTMLElement) {
    handleCubeClick(cubeIndex, player);
    // @ts-expect-error: window.gameState is not typed
    const gameState = window.gameState;
    const playerState = player === 'human' ? gameState.humanPlayer : gameState.computerPlayer;
    const cubesArr = playerState.board.cubes;
    // Update the UI for the player after the click
    updatePlayerComponent(board, cubesArr, playerState);
}

/**
 * Called by the UI when a click outside the board occurs (to unselect).
 */
export function onUnselect() {
    // Unselect logic removed; handled by game state update elsewhere
}
