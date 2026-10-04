import type { ReadonlyGameState } from '../types/ReadonlyGameState';
import { getElement } from './getElement';

/**
 * Draws the Stats tab.
 */

/**
 * The bars of the "Groups you've removed, by size" chart: one for each size from 2 to 9, then ranges for the bigger
 * (and rarer) sizes, so the chart stays a readable width on a phone however big the groups get
 */
const GROUP_SIZE_BARS: readonly { readonly min: number; readonly max: number }[] = [
    ...[2, 3, 4, 5, 6, 7, 8, 9].map((size) => ({ min: size, max: size })),
    { min: 10, max: 14 },
    { min: 15, max: 19 },
    { min: 20, max: 29 },
    { min: 30, max: Infinity },
];

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
    getElement('group-size-counts').innerHTML = renderGroupSizeChart(gameStats.groupSizeCounts);
}

/**
 * Counts the groups removed in each bar of the group size chart (see GROUP_SIZE_BARS), from the first bar up to the
 * last one with any groups in it (so the chart doesn't end in a row of empty bars).
 *
 * @param groupSizeCounts - How many groups of each size have been removed (size -> count)
 * @returns Each bar's label (e.g. "2", "10–14", "30+") and how many groups it holds; empty if there are no groups
 */
export function getGroupSizeBars(
    groupSizeCounts: Readonly<Record<number, number>>,
): { label: string; count: number }[] {
    const sizes = Object.entries(groupSizeCounts).map(([size, count]) => ({ size: Number(size), count }));
    const bars = GROUP_SIZE_BARS.map(({ min, max }) => ({
        label: min === max ? String(min) : max === Infinity ? `${min}+` : `${min}–${max}`,
        count: sizes.filter(({ size }) => size >= min && size <= max).reduce((total, { count }) => total + count, 0),
    }));
    const lastUsed = bars.map((bar) => bar.count > 0).lastIndexOf(true);
    return bars.slice(0, lastUsed + 1);
}

/**
 * Builds the "Groups you've removed, by size" bar chart: a bar for each size (or range of sizes), as tall as its share
 * of the most groups in any bar, with its count above it and its size below. Each bar's height is a CSS custom
 * property (`--fill`, from 0 to 1), since it comes from the game state.
 *
 * @param groupSizeCounts - How many groups of each size have been removed (size -> count)
 * @returns The chart's HTML, or a message if no groups have been removed yet
 */
function renderGroupSizeChart(groupSizeCounts: Readonly<Record<number, number>>): string {
    const bars = getGroupSizeBars(groupSizeCounts);
    if (bars.length === 0) return '<p class="muted">No groups removed yet.</p>';
    const most = Math.max(...bars.map((bar) => bar.count));
    const items = bars
        .map(({ label, count }) => {
            const description = `Size ${label}: ${count} ${count === 1 ? 'group' : 'groups'}`;
            // A line break may go after the dash of a range, so narrow bars (on a phone) can fit "10–14"
            const shownLabel = label.replace('–', '–<wbr>');
            return `<li class="histogram-bar${count === 0 ? ' empty' : ''}" title="${description}"
                    aria-label="${description}">
                <span class="histogram-count" aria-hidden="true">${count}</span>
                <span class="histogram-fill" style="--fill: ${count / most}"></span>
                <span class="histogram-label" aria-hidden="true">${shownLabel}</span>
            </li>`;
        })
        .join('');
    return `<ol class="histogram">${items}</ol><p class="histogram-axis muted">Group size</p>`;
}
