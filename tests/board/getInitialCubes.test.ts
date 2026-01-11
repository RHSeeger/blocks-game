// Tests for getInitialCubes in board.ts
import { getInitialCubes } from '../../src/typescript/board';

describe('getInitialCubes', () => {
    it('returns 100 cubes for player', () => {
        const cubes = getInitialCubes('player', []);
        expect(Array.isArray(cubes)).toBe(true);
        expect(cubes.length).toBe(100);
    });
    it('returns 100 cubes for computer', () => {
        const cubes = getInitialCubes('computer', []);
        expect(Array.isArray(cubes)).toBe(true);
        expect(cubes.length).toBe(100);
    });
    it('all cubes have a color or null', () => {
        const cubes = getInitialCubes('player', []);
        for (const cube of cubes) {
            expect('color' in cube).toBe(true);
        }
    });
});
