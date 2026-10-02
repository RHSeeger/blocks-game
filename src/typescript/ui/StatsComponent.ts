import type { ReadonlyGameState } from '../types/ReadonlyGameState';
import { getElement } from './getElement';

/**
 * Draws the Stats tab.
 */

/**
 * Draws the Stats tab.
 *
 * @param gameState - The game state (read-only)
 */
export function renderStats(gameState: ReadonlyGameState): void {
    const { gameStats, humanPlayer, computerPlayer } = gameState;
    getElement('largest-group-value').textContent = String(gameStats.largestGroup);
    getElement('stats-max-board-score').textContent = String(humanPlayer.maxBoardScore);
    getElement('stats-board-score').textContent = String(humanPlayer.boardScore);
    getElement('stats-max-board-score-computer').textContent = String(computerPlayer.maxBoardScore);
    getElement('stats-board-score-computer').textContent = String(computerPlayer.boardScore);

    const sizes = Object.keys(gameStats.groupSizeCounts)
        .map(Number)
        .sort((a, b) => b - a);
    const items = sizes.map((size) => `<li>Size ${size}: ${gameStats.groupSizeCounts[size]}</li>`).join('');
    getElement('group-size-counts').innerHTML =
        `<b>Block groups removed (by size):</b><ul style="margin-top:0">${items}</ul>`;
}
