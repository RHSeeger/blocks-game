// Tests for calculateGroupScore in board.ts
import { calculateGroupScore } from '../../src/typescript/board';

describe('calculateGroupScore', () => {
    it('returns 0 for group size 0', () => {
        expect(calculateGroupScore(0)).toBe(0);
    });
    it('returns 0 for group size 1', () => {
        expect(calculateGroupScore(1)).toBe(0);
    });
    it('returns correct score for group size 2', () => {
        expect(calculateGroupScore(2)).toBe(2);
    });
    it('returns correct score for group size 5', () => {
        expect(calculateGroupScore(5)).toBe(10);
    });
    it('returns correct score for group size 10', () => {
        expect(calculateGroupScore(10)).toBe(45);
    });
});
