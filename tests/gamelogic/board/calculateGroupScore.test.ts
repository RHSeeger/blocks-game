import { calculateGroupScore } from '../../../src/typescript/gamelogic/board/calculateGroupScore';

/**
 * Tests for the group scoring formula.
 *
 * Changed 2026-10-03: a group's score is now its size times itself (it used to grow by 1 point per block each time
 * the size doubled, e.g. 10 blocks scored 29), so that planning for big groups pays off. See design/decisions.md.
 */

describe('calculateGroupScore', () => {
    it.each([
        [0, 0],
        [1, 1],
        [2, 4],
        [3, 9],
        [5, 25],
        [10, 100],
        [20, 400],
    ])('scores a group of %i as %i', (size, expected) => {
        expect(calculateGroupScore(size)).toBe(expected);
    });

    it('scores one big group more than the same blocks in smaller groups', () => {
        expect(calculateGroupScore(10)).toBeGreaterThan(5 * calculateGroupScore(2));
    });
});
