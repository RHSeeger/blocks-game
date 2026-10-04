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
    // No board finished yet: there's no fewest blocks left to show
    getElement('stats-fewest-blocks-left').textContent =
        gameStats.fewestBlocksLeft === null ? '-' : String(gameStats.fewestBlocksLeft);
    getElement('stats-tidy-boards').textContent = String(gameStats.tidyBoards);
    getElement('stats-spotless-boards').textContent = String(gameStats.spotlessBoards);
    getElement('stats-max-board-score').textContent = String(humanPlayer.maxBoardScore);
    getElement('stats-board-score').textContent = String(humanPlayer.boardScore);
    getElement('stats-max-board-score-computer').textContent = String(computerPlayer.maxBoardScore);
    getElement('stats-board-score-computer').textContent = String(computerPlayer.boardScore);

    const sizes = Object.keys(gameStats.groupSizeCounts)
        .map(Number)
        .sort((a, b) => b - a);
    const rows = sizes.map((size) => `<tr><td>${size}</td><td>${gameStats.groupSizeCounts[size]}</td></tr>`).join('');
    getElement('group-size-counts').innerHTML =
        sizes.length === 0
            ? '<p class="muted">No groups removed yet.</p>'
            : `<table class="data-table"><thead><tr><th>Group size</th><th>Removed</th></tr></thead>
                <tbody>${rows}</tbody></table>`;
}
