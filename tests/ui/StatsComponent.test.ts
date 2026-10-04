import { getGroupSizeBars, renderStats } from '../../src/typescript/ui/StatsComponent';
import { makeGameState } from '../helpers/testBoards';

/**
 * Tests for drawing the Stats tab.
 */

describe('renderStats', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <span id="largest-group-value"></span><span id="stats-max-board-score"></span>
            <span id="stats-fewest-blocks-left"></span><span id="stats-tidy-boards"></span>
            <span id="stats-spotless-boards"></span>
            <span id="stats-board-score"></span><span id="stats-max-board-score-computer"></span>
            <span id="stats-board-score-computer"></span><div id="group-size-counts"></div>`;
    });

    it('says so when no groups have been removed yet', () => {
        renderStats(makeGameState());
        expect(document.getElementById('group-size-counts')?.textContent).toContain('No groups removed yet');
    });

    // Changed 2026-10-03: the groups by size were a table (a row per size, largest first); they're now a bar chart
    it('shows the largest group, and a bar chart of the groups removed by size', () => {
        const gameState = makeGameState();
        gameState.gameStats.largestGroup = 12;
        gameState.gameStats.groupSizeCounts = { 2: 5, 12: 1 };
        renderStats(gameState);

        expect(document.getElementById('largest-group-value')?.textContent).toBe('12');
        const bars = [...document.querySelectorAll('#group-size-counts .histogram-bar')];
        // Sizes 2 to 9, then 10–14 (where the 12 is)
        expect(bars.map((bar) => bar.getAttribute('aria-label'))).toEqual([
            'Size 2: 5 groups',
            'Size 3: 0 groups',
            'Size 4: 0 groups',
            'Size 5: 0 groups',
            'Size 6: 0 groups',
            'Size 7: 0 groups',
            'Size 8: 0 groups',
            'Size 9: 0 groups',
            'Size 10–14: 1 group',
        ]);
        // The tallest bar is full height; the others are a share of it
        const fill = (bar: Element) =>
            (bar.querySelector('.histogram-fill') as HTMLElement).style.getPropertyValue('--fill');
        expect(fill(bars[0])).toBe('1');
        expect(fill(bars[8])).toBe('0.2');
        expect(bars[1].classList.contains('empty')).toBe(true);
    });

    it('shows the clean-board statistics, with a dash for the fewest blocks left before any board is finished', () => {
        const gameState = makeGameState();
        renderStats(gameState);
        expect(document.getElementById('stats-fewest-blocks-left')?.textContent).toBe('-');

        gameState.gameStats.fewestBlocksLeft = 1;
        gameState.gameStats.tidyBoards = 4;
        gameState.gameStats.spotlessBoards = 2;
        renderStats(gameState);
        expect(document.getElementById('stats-fewest-blocks-left')?.textContent).toBe('1');
        expect(document.getElementById('stats-tidy-boards')?.textContent).toBe('4');
        expect(document.getElementById('stats-spotless-boards')?.textContent).toBe('2');
    });
});

describe('getGroupSizeBars', () => {
    it('has a bar for each size from 2 to 9, then ranges, ending at the last bar with any groups', () => {
        expect(getGroupSizeBars({ 2: 3, 4: 1 })).toEqual([
            { label: '2', count: 3 },
            { label: '3', count: 0 },
            { label: '4', count: 1 },
        ]);
    });

    it('adds up the sizes in each range, and puts 30 and over in one bar', () => {
        const bars = getGroupSizeBars({ 10: 1, 14: 2, 15: 1, 25: 4, 30: 1, 64: 2 });
        expect(bars.slice(8)).toEqual([
            { label: '10–14', count: 3 },
            { label: '15–19', count: 1 },
            { label: '20–29', count: 4 },
            { label: '30+', count: 3 },
        ]);
    });

    it('has no bars when no groups have been removed', () => {
        expect(getGroupSizeBars({})).toEqual([]);
    });
});
