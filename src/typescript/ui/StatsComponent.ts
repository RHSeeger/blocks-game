// StatsComponent.ts
// Handles stats display DOM updates
import type { GameState } from "../gameState";
import { savePlayerStats } from "../initialization";

export function updateStatsDisplay(gameState: GameState) {
    const largestGroupElem = document.getElementById('largest-group-value');
    const groupSizeCountsElem = document.getElementById('group-size-counts');
    if (largestGroupElem) {
        largestGroupElem.textContent = gameState.gameStats.largestGroup.toString();
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
