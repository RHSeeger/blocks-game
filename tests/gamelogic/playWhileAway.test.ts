import { playWhileAway } from '../../src/typescript/gamelogic/playWhileAway';
import { getAwayPlayMs } from '../../src/typescript/gamelogic/awayPlayTime';
import { takeComputerTurn } from '../../src/typescript/gamelogic/takeComputerTurn';
import { AWAY_MAX_MS } from '../../src/typescript/data/away';
import { AWAY_PLAY } from '../../src/typescript/data/upgrades';
import type { GameState } from '../../src/typescript/types/GameState';
import { makeGameState } from '../helpers/testBoards';

/**
 * Tests for progress while away. The computer's turn is replaced with a predictable one, so what catching up adds up
 * to can be checked exactly: each turn scores 10 (and so 10 Chips), and every 5th turn finishes a board.
 */

jest.mock('../../src/typescript/gamelogic/takeComputerTurn');

/** The computer's turns are 1 second apart (no Faster Computer levels) */
const TURN_MS = 1000;

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

/** A clock for the time budget that never moves, so every turn fits in the budget */
const stoppedClock = () => 0;

/**
 * Returns a clock for the time budget that moves 1ms each time it's read, so about `budget` turns fit in a budget of
 * `budget` milliseconds.
 *
 * @returns The clock
 */
const tickingClock = () => {
    let now = 0;
    return () => now++;
};

describe('playWhileAway', () => {
    let turnsTaken: number;

    beforeEach(() => {
        turnsTaken = 0;
        jest.mocked(takeComputerTurn).mockImplementation((gameState: GameState) => {
            turnsTaken++;
            gameState.computerPlayer.totalScore += 10;
            gameState.wallet.chips += 10;
            if (turnsTaken % 5 === 0) gameState.computerPlayer.boardNumber += 1;
            return [];
        });
    });

    it('plays one turn for each turn-length of time away, and sums up what they earned', () => {
        const gameState = makeGameState();
        const summary = playWhileAway(gameState, 30 * TURN_MS, 1000, stoppedClock);

        expect(turnsTaken).toBe(30);
        expect(summary).toEqual({
            kind: 'awayProgress',
            awayMs: 30_000,
            playMs: 30_000, // within the first 15 minutes, so at full speed
            capped: false,
            boards: 6,
            score: 300,
            gems: 0,
        });
        expect(gameState.computerPlayer.totalScore).toBe(300);
        expect(gameState.wallet.chips).toBe(300);
    });

    it("estimates the turns that don't fit in the time budget from the ones that were played", () => {
        const gameState = makeGameState();
        // 100 turns away; the budget fits 10 of them (each turn reads the clock once, as does the start)
        const summary = playWhileAway(gameState, 100 * TURN_MS, 11, tickingClock());

        expect(turnsTaken).toBe(10);
        // The 10 turns played scored 100 and finished 2 boards; the other 90 are 9 times that
        expect(summary.kind === 'awayProgress' && [summary.score, summary.boards]).toEqual([1000, 20]);
        expect(gameState.wallet.chips).toBe(1000);
        expect(gameState.computerPlayer.boardNumber).toBe(21);
    });

    it('adds a Gem for each milestone board the estimated boards pass', () => {
        const gameState = makeGameState();
        const summary = playWhileAway(gameState, 100 * TURN_MS, 11, tickingClock());
        // Boards 1 to 20 were finished: the milestones are the 10th and 20th
        expect(summary.kind === 'awayProgress' && summary.gems).toBe(2);
        expect(gameState.wallet.gems).toBe(2);
    });

    it('plays slower the longer it was away: 8 hours away is worth 52.5 minutes of play', () => {
        const gameState = makeGameState();
        const summary = playWhileAway(gameState, 8 * HOUR, 11, tickingClock());
        const playMs = 52.5 * MINUTE;
        expect(summary.kind === 'awayProgress' && [summary.awayMs, summary.playMs, summary.capped]).toEqual([
            8 * HOUR,
            playMs,
            false,
        ]);
        expect(summary.kind === 'awayProgress' && summary.score).toBe((playMs / TURN_MS) * 10);
    });

    it("doesn't count time away past the most that counts", () => {
        const gameState = makeGameState();
        const summary = playWhileAway(gameState, AWAY_MAX_MS * 3, 11, tickingClock());
        expect(summary.kind === 'awayProgress' && [summary.playMs, summary.capped]).toEqual([60 * MINUTE, true]);
    });

    it('counts time away for more with "Better While Away"', () => {
        const gameState = makeGameState();
        gameState.computerPlayer.upgradeLevels[AWAY_PLAY] = 5;
        const summary = playWhileAway(gameState, 8 * HOUR, 11, tickingClock());
        expect(summary.kind === 'awayProgress' && summary.playMs).toBeCloseTo(getAwayPlayMs(8 * HOUR, 0.75));
    });
});

describe('getAwayPlayMs', () => {
    it.each([
        [10 * MINUTE, 10 * MINUTE], // full speed for the first 15 minutes
        [15 * MINUTE, 15 * MINUTE],
        [30 * MINUTE, 22.5 * MINUTE], // + 15 minutes at half speed
        [1 * HOUR, 30 * MINUTE], // + 30 minutes at a quarter
        [2 * HOUR, 37.5 * MINUTE],
        [4 * HOUR, 45 * MINUTE],
        [8 * HOUR, 52.5 * MINUTE],
        [16 * HOUR, 60 * MINUTE], // the most it can be worth
        [7 * 24 * HOUR, 60 * MINUTE], // a week away is worth no more
    ])('counts %i ms away as %i ms of play', (awayMs, playMs) => {
        expect(getAwayPlayMs(awayMs)).toBeCloseTo(playMs);
    });

    it.each([
        // With 75% of the speed kept from step to step (the last level of "Better While Away")
        [10 * MINUTE, 10 * MINUTE], // the first 15 minutes are still full speed
        [30 * MINUTE, 26.25 * MINUTE], // + 15 minutes at 75%
        [1 * HOUR, 43.125 * MINUTE], // + 30 minutes at 56.25%
        [8 * HOUR, 163.4 * MINUTE],
        [16 * HOUR, 248.8 * MINUTE], // the most it can be worth
        [7 * 24 * HOUR, 248.8 * MINUTE],
    ])('keeping 75%% of the speed, counts %i ms away as %i ms of play', (awayMs, playMs) => {
        expect(getAwayPlayMs(awayMs, 0.75) / MINUTE).toBeCloseTo(playMs / MINUTE, 1);
    });
});
