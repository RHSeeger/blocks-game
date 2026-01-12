// Tests for isBoardFinished in board.ts
import { isBoardFinished } from '../../src/typescript/BoardState';
import type { Cube } from '../../src/typescript/Cube';

describe('isBoardFinished', () => {
    it('returns true if all cubes are null', () => {
        const cubes: Cube[] = Array(100)
            .fill(null)
            .map(() => ({ color: null }));
        expect(isBoardFinished(cubes)).toBe(true);
    });
    it('returns true if no removable groups of 2+ exist', () => {
        // Only isolated single cubes of different colors
        const cubes: Cube[] = Array(100)
            .fill(null)
            .map(() => ({ color: null }));
        cubes[0] = { color: 'red' };
        cubes[10] = { color: 'blue' };
        cubes[20] = { color: 'green' };
        expect(isBoardFinished(cubes)).toBe(true);
    });
    it('returns false if a removable group of 2+ exists', () => {
        // Two adjacent cubes of the same color
        const cubes: Cube[] = Array(100)
            .fill(null)
            .map(() => ({ color: null }));
        cubes[0] = { color: 'red' };
        cubes[1] = { color: 'red' };
        expect(isBoardFinished(cubes)).toBe(false);
    });
    it('returns false if a removable group of 3+ exists', () => {
        // Three adjacent cubes of the same color
        const cubes: Cube[] = Array(100)
            .fill(null)
            .map(() => ({ color: null }));
        cubes[0] = { color: 'blue' };
        cubes[1] = { color: 'blue' };
        cubes[2] = { color: 'blue' };
        expect(isBoardFinished(cubes)).toBe(false);
    });
    it('returns true if only single cubes remain after groups are removed', () => {
        // No two adjacent cubes of the same color
        const cubes: Cube[] = Array(100)
            .fill(null)
            .map(() => ({ color: null }));
        cubes[0] = { color: 'red' };
        cubes[1] = { color: 'blue' };
        cubes[2] = { color: 'green' };
        expect(isBoardFinished(cubes)).toBe(true);
    });
});
