import { recordBoardFinished, recordGroupRemoved } from '../../src/typescript/gamelogic/gameStats';
import { applyBlockClick } from '../../src/typescript/gamelogic/applyBlockClick';
import { boardWithFirstRow, makeGameState, plus1, regular } from '../helpers/testBoards';

/**
 * Tests for keeping the game statistics up to date.
 */

/** The statistics before anything has happened */
const noStats = () => ({
    largestGroup: 0,
    groupSizeCounts: {},
    fewestBlocksLeft: null,
    tidyBoards: 0,
    spotlessBoards: 0,
});

describe('recordGroupRemoved', () => {
    it('tracks the largest group, and counts groups by size', () => {
        const { gameStats } = makeGameState();
        recordGroupRemoved(gameStats, 3);
        recordGroupRemoved(gameStats, 5);
        recordGroupRemoved(gameStats, 3);
        expect(gameStats.largestGroup).toBe(5);
        expect(gameStats.groupSizeCounts).toEqual({ 3: 2, 5: 1 });
    });
});

describe('recordBoardFinished', () => {
    it('tracks the fewest blocks left on a finished board', () => {
        const { gameStats } = makeGameState();
        recordBoardFinished(gameStats, 7);
        expect(gameStats.fewestBlocksLeft).toBe(7);
        recordBoardFinished(gameStats, 4);
        recordBoardFinished(gameStats, 9);
        expect(gameStats.fewestBlocksLeft).toBe(4);
    });

    it('counts tidy boards (2 or fewer blocks left) and spotless ones (none left; also tidy)', () => {
        const { gameStats } = makeGameState();
        [3, 2, 1, 0, 5].forEach((blocksLeft) => recordBoardFinished(gameStats, blocksLeft));
        expect(gameStats.tidyBoards).toBe(3);
        expect(gameStats.spotlessBoards).toBe(1);
        expect(gameStats.fewestBlocksLeft).toBe(0);
    });
});

describe('game statistics when a group is removed', () => {
    // Changed 2026-10-03: this move also finishes the board with no blocks left, which is now recorded too
    it('are updated when the human player removes a group, counting blocks a +1 added (but not the +1)', () => {
        const gameState = makeGameState(boardWithFirstRow([regular('blue'), regular('red'), regular('red'), plus1()]));
        applyBlockClick(gameState, 'human', 1);
        applyBlockClick(gameState, 'human', 1);
        expect(gameState.gameStats).toEqual({
            largestGroup: 3,
            groupSizeCounts: { 3: 1 },
            fewestBlocksLeft: 0,
            tidyBoards: 1,
            spotlessBoards: 1,
        });
    });

    it('record how clean the board was when the human player finishes one', () => {
        // The reds go; blue, green and yellow are left, with no moves
        const gameState = makeGameState(
            boardWithFirstRow([regular('blue'), regular('red'), regular('red'), regular('green'), regular('yellow')]),
        );
        applyBlockClick(gameState, 'human', 1);
        applyBlockClick(gameState, 'human', 1);
        expect(gameState.gameStats.fewestBlocksLeft).toBe(3);
        expect(gameState.gameStats.tidyBoards).toBe(0);
    });

    it('do not record a board as finished while it still has moves', () => {
        const gameState = makeGameState(
            boardWithFirstRow([regular('red'), regular('red'), regular('blue'), regular('blue')]),
        );
        applyBlockClick(gameState, 'human', 0);
        applyBlockClick(gameState, 'human', 0);
        expect(gameState.gameStats.fewestBlocksLeft).toBeNull();
    });

    it('are not updated by selecting a group', () => {
        const gameState = makeGameState(boardWithFirstRow([regular('red'), regular('red')]));
        applyBlockClick(gameState, 'human', 0);
        expect(gameState.gameStats).toEqual(noStats());
    });

    it('are not updated by the computer player', () => {
        const gameState = makeGameState(undefined, boardWithFirstRow([regular('red'), regular('red')]));
        applyBlockClick(gameState, 'computer', 0);
        applyBlockClick(gameState, 'computer', 0);
        expect(gameState.gameStats).toEqual(noStats());
    });
});
