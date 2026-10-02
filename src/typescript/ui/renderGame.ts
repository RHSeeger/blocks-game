import type { DerivedGameInfo } from '../types/DerivedGameInfo';
import type { ReadonlyGameState } from '../types/ReadonlyGameState';
import { renderAchievements } from './AchievementsComponent';
import { renderAugmentations } from './AugmentationsComponent';
import { renderPlayerArea } from './PlayerComponent';
import { renderStats } from './StatsComponent';

/**
 * Draws the whole game display from the game state. Called (through the bridge) every time the game state changes.
 */

/**
 * Draws the whole game display: both players' areas and every tab.
 *
 * @param gameState - The game state (read-only)
 * @param derived - Values calculated from the game state by game logic
 */
export function renderGame(gameState: ReadonlyGameState, derived: DerivedGameInfo): void {
    renderPlayerArea('human', gameState.humanPlayer, derived.boardFinished.human);
    renderPlayerArea('computer', gameState.computerPlayer, derived.boardFinished.computer);
    renderStats(gameState);
    renderAchievements(gameState);
    renderAugmentations(gameState);
}
