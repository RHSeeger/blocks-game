import { updatePlayerComponent } from './PlayerComponent';
import { updateStatsDisplay } from './StatsComponent';
import { updateAchievementsDisplay } from './AchievementsComponent';
import { updateUnlocksDisplay } from './UnlocksComponent';
import type { GameState } from '../GameState';

/**
 * Updates all UI components that reflect the current game state.
 * Reads from window.gameState. Optionally takes a player type for future use.
 */
export function updateAllGameUi(player?: 'human' | 'computer'): void {
    // @ts-expect-error: window.gameState is not typed
    const gameState: GameState = window.gameState;
    const humanBoard = document.getElementById('human-board');
    if (humanBoard) {
        updatePlayerComponent(humanBoard, gameState.humanPlayer.board.cubes, gameState.humanPlayer);
    }
    updateStatsDisplay(gameState);
    updateAchievementsDisplay(gameState);
    updateUnlocksDisplay(gameState);
    // Add more UI updates as needed
}
