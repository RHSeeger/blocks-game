// Tests for isBoardFinished in board.ts
import { isBoardFinished } from '../../src/typescript/gamelogic/BoardState';
import { Cube } from '../../src/typescript/gamelogic/Cube';

describe('isBoardFinished', () => {
    it('returns true if all cubes are null', () => {
        const cubes: any[] = Array(100)
            .fill(null)
            .map(() => new Cube(null));
        expect(isBoardFinished(cubes)).toBe(true);
    });
    it('returns true if no removable groups of 2+ exist', () => {
        // Only isolated single cubes of different colors
        const cubes: any[] = Array(100)
            .fill(null)
            .map(() => new Cube(null));
        cubes[0] = new Cube('red');
        cubes[10] = new Cube('blue');
        cubes[20] = new Cube('green');
        expect(isBoardFinished(cubes)).toBe(true);
    });
    it('returns false if a removable group of 2+ exists', () => {
        // Two adjacent cubes of the same color
        const cubes: any[] = Array(100)
            .fill(null)
            .map(() => new Cube(null));
        cubes[0] = new Cube('red');
        cubes[1] = new Cube('red');
        expect(isBoardFinished(cubes)).toBe(false);
    });
    it('returns false if a removable group of 3+ exists', () => {
        // Three adjacent cubes of the same color
        const cubes: any[] = Array(100)
            .fill(null)
            .map(() => new Cube(null));
        cubes[0] = new Cube('blue');
        cubes[1] = new Cube('blue');
        cubes[2] = new Cube('blue');
        expect(isBoardFinished(cubes)).toBe(false);
    });
    it('returns true if only single cubes remain after groups are removed', () => {
        // No two adjacent cubes of the same color
        const cubes: any[] = Array(100)
            .fill(null)
            .map(() => new Cube(null));
        cubes[0] = new Cube('red');
        cubes[1] = new Cube('blue');
        cubes[2] = new Cube('green');
        expect(isBoardFinished(cubes)).toBe(true);
    });
});
