import { updatePlayerComponent } from './PlayerComponent';
import { updateStatsDisplay } from './StatsComponent';
import { updateAchievementsDisplay } from './AchievementsComponent';
import { updateUnlocksDisplay } from './UnlocksComponent';
import { updateBoardScoreDisplays } from './GameComponent';
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
        // Ensure we pass CubeView[] (objects with getColor/getSpecial) to updatePlayerComponent
        const cubesArr = gameState.humanPlayer.board.cubes.map(cube => {
            // If already has getColor, assume it's a CubeView
            if (typeof cube.getColor === 'function' && typeof cube.getSpecial === 'function') {
                return cube;
            }
            // Defensive fallback: wrap as CubeView
            return {
                getColor: () => cube.color ?? null,
                getSpecial: () => cube.special
            };
        });
        updatePlayerComponent(
            humanBoard,
            cubesArr,
            gameState.humanPlayer as any // Should be PlayerStateView
        );
    }
    updateStatsDisplay(gameState);
    updateAchievementsDisplay(gameState);
    updateUnlocksDisplay(gameState);
    updateBoardScoreDisplays(gameState);
    // Add more UI updates as needed
}
