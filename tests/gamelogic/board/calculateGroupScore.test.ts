import { calculateGroupScore } from '../../../src/typescript/gamelogic/board/calculateGroupScore';

/**
 * Tests for the group scoring formula.
 */

describe('calculateGroupScore', () => {
    it.each([
        [0, 0],
        [1, 1],
        [2, 3], // 1 + 2
        [3, 5], // 1 + 2 + 2
        [4, 8], // 1 + 2 + 2 + 3
        [5, 11], // 1 + 2 + 2 + 3 + 3
        [6, 14], // 1 + 2 + 2 + 3 + 3 + 3
        [8, 21], // 1 + 2 + 2 + 3 + 3 + 3 + 3 + 4
        [10, 29], // 1 + 2 + 2 + 3 + 3 + 3 + 3 + 4 + 4 + 4
    ])('scores a group of %i as %i', (size, expected) => {
        expect(calculateGroupScore(size)).toBe(expected);
    });
});
