import { runComputerTick } from '../../src/typescript/gamelogic/gameLoop';
import { playWhileAway } from '../../src/typescript/gamelogic/playWhileAway';
import { takeComputerTurn } from '../../src/typescript/gamelogic/takeComputerTurn';
import { AWAY_MIN_MS } from '../../src/typescript/data/away';
import type { GameNotification } from '../../src/typescript/types/GameNotification';
import { makeGameState } from '../helpers/testBoards';

/**
 * Tests for one tick of the computer player: catching up on time away first, when there's been a long gap since its
 * last turn. Catching up, and the turn itself, are replaced with stand-ins that record how they were called.
 */

jest.mock('../../src/typescript/gamelogic/playWhileAway');
jest.mock('../../src/typescript/gamelogic/takeComputerTurn');

const awaySummary: GameNotification = {
    kind: 'awayProgress',
    awayMs: 0,
    playMs: 0,
    capped: false,
    boards: 0,
    score: 0,
    gems: 0,
};

describe('runComputerTick', () => {
    beforeEach(() => {
        jest.mocked(playWhileAway).mockReset().mockReturnValue(awaySummary);
        jest.mocked(takeComputerTurn).mockReset().mockReturnValue([]);
    });

    it('takes a turn, and records when, after a normal gap', () => {
        const gameState = makeGameState();
        gameState.computerLastTurnAt = 5000;
        expect(runComputerTick(gameState, 6000)).toEqual([]);
        expect(playWhileAway).not.toHaveBeenCalled();
        expect(takeComputerTurn).toHaveBeenCalledTimes(1);
        expect(gameState.computerLastTurnAt).toBe(6000);
    });

    it('catches up on the time away first, after a long gap, and sends the summary', () => {
        const gameState = makeGameState();
        gameState.computerLastTurnAt = 5000;
        const notifications = runComputerTick(gameState, 5000 + AWAY_MIN_MS);
        expect(playWhileAway).toHaveBeenCalledWith(gameState, AWAY_MIN_MS);
        expect(notifications).toEqual([awaySummary]);
        expect(takeComputerTurn).toHaveBeenCalledTimes(1);
        expect(gameState.computerLastTurnAt).toBe(5000 + AWAY_MIN_MS);
    });
});
