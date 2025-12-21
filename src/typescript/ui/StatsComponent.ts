// StatsComponent.ts
// Handles stats display DOM updates
import type { GameState } from "../gameState";
import { savePlayerStats } from "../initialization";

export function updateStatsDisplay(gameState: GameState) {
    // All display logic reads from gameState only
    const largestGroupElem = document.getElementById('largest-group-value');
    const groupSizeCountsElem = document.getElementById('group-size-counts');
    const maxBoardScoreElem = document.getElementById('stats-max-board-score');
    const boardScoreElem = document.getElementById('stats-board-score');
    const maxBoardScoreElemComputer = document.getElementById('stats-max-board-score-computer');
    const boardScoreElemComputer = document.getElementById('stats-board-score-computer');
    if (largestGroupElem) {
        largestGroupElem.textContent = gameState.gameStats.largestGroup.toString();
    }
    if (maxBoardScoreElem) {
        maxBoardScoreElem.textContent = gameState.humanPlayer.maxBoardScore?.toString() ?? '0';
    }
    if (boardScoreElem) {
        boardScoreElem.textContent = gameState.humanPlayer.boardScore?.toString() ?? '0';
    }
    if (maxBoardScoreElemComputer) {
        maxBoardScoreElemComputer.textContent = gameState.computerPlayer.maxBoardScore?.toString() ?? '0';
    }
    if (boardScoreElemComputer) {
        boardScoreElemComputer.textContent = gameState.computerPlayer.boardScore?.toString() ?? '0';
    }
    if (groupSizeCountsElem) {
        let html = '<b>Block groups removed (by size):</b><ul style="margin-top:0">';
        const sizes = Object.keys(gameState.gameStats.groupSizeCounts).map(Number).sort((a, b) => b - a);
        for (const size of sizes) {
            html += `<li>Size ${size}: ${gameState.gameStats.groupSizeCounts[size]}</li>`;
        }
        html += '</ul>';
        groupSizeCountsElem.innerHTML = html;
    }
    savePlayerStats(gameState.gameStats);
}
