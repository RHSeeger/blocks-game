import { renderStats } from '../../src/typescript/ui/StatsComponent';
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

    it('shows the largest group, and a row for each group size, largest first', () => {
        const gameState = makeGameState();
        gameState.gameStats.largestGroup = 12;
        gameState.gameStats.groupSizeCounts = { 2: 5, 12: 1 };
        renderStats(gameState);

        expect(document.getElementById('largest-group-value')?.textContent).toBe('12');
        const rows = [...document.querySelectorAll('#group-size-counts tbody tr')].map((row) =>
            [...row.children].map((cell) => cell.textContent),
        );
        expect(rows).toEqual([
            ['12', '1'],
            ['2', '5'],
        ]);
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
