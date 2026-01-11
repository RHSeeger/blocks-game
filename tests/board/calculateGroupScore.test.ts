// Tests for calculateGroupScore in board.ts
import { calculateGroupScore } from '../../src/typescript/board';

describe('calculateGroupScore', () => {
    it('returns 0 for group size 0', () => {
        expect(calculateGroupScore(0)).toBe(0);
    });
    it('returns 1 for group size 1', () => {
        expect(calculateGroupScore(1)).toBe(1);
    });
    it('returns 3 for group size 2', () => {
        expect(calculateGroupScore(2)).toBe(3); // 1 + 2
    });
    it('returns 5 for group size 3', () => {
        expect(calculateGroupScore(3)).toBe(5); // 1 + 2 + 2
    });
    it('returns 8 for group size 4', () => {
        expect(calculateGroupScore(4)).toBe(8); // 1 + 2 + 2 + 3
    });
    it('returns 11 for group size 5', () => {
        expect(calculateGroupScore(5)).toBe(11); // 1 + 2 + 2 + 3 + 3
    });
    it('returns 14 for group size 6', () => {
        expect(calculateGroupScore(6)).toBe(14); // 1 + 2 + 2 + 3 + 3 + 3
    });
    it('returns 21 for group size 8', () => {
        expect(calculateGroupScore(8)).toBe(21); // 1 + 2 + 2 + 3 + 3 + 3 + 3 + 4
    });
    it('returns 29 for group size 10', () => {
        expect(calculateGroupScore(10)).toBe(29); // 1 + 2 + 2 + 3 + 3 + 3 + 3 + 4 + 4 + 4
    });
});
