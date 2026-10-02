import { recordGroupRemoved } from '../../src/typescript/gamelogic/gameStats';
import { applyBlockClick } from '../../src/typescript/gamelogic/applyBlockClick';
import { boardWithFirstRow, makeGameState, plus1, regular } from '../helpers/testBoards';

/**
 * Tests for keeping the game statistics up to date.
 */

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

describe('game statistics when a group is removed', () => {
    it('are updated when the human player removes a group, counting blocks a +1 added (but not the +1)', () => {
        const gameState = makeGameState(boardWithFirstRow([regular('blue'), regular('red'), regular('red'), plus1()]));
        applyBlockClick(gameState, 'human', 1);
        applyBlockClick(gameState, 'human', 1);
        expect(gameState.gameStats).toEqual({ largestGroup: 3, groupSizeCounts: { 3: 1 } });
    });

    it('are not updated by selecting a group', () => {
        const gameState = makeGameState(boardWithFirstRow([regular('red'), regular('red')]));
        applyBlockClick(gameState, 'human', 0);
        expect(gameState.gameStats).toEqual({ largestGroup: 0, groupSizeCounts: {} });
    });

    it('are not updated by the computer player', () => {
        const gameState = makeGameState(undefined, boardWithFirstRow([regular('red'), regular('red')]));
        applyBlockClick(gameState, 'computer', 0);
        applyBlockClick(gameState, 'computer', 0);
        expect(gameState.gameStats).toEqual({ largestGroup: 0, groupSizeCounts: {} });
    });
});
