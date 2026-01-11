// Example unit test for BoardState.getConnectedIndices
import { getConnectedIndices } from '../../src/typescript/board';
import type { Cube } from '../../src/typescript/cube';

describe('getConnectedIndices', () => {
    it('returns all indices of a simple 2-block group', () => {
        const cubes: Cube[] = Array(100)
            .fill(null)
            .map(() => ({ color: null }));
        cubes[0] = { color: 'red' };
        cubes[1] = { color: 'red' };
        expect(getConnectedIndices(0, cubes).sort()).toEqual([0, 1]);
    });

    it('does not treat end of one row and start of next row as adjacent (row wraparound left)', () => {
        const cubes: Cube[] = Array(100)
            .fill(null)
            .map(() => ({ color: null }));
        cubes[9] = { color: 'red' }; // last col of first row
        cubes[10] = { color: 'red' }; // first col of second row
        expect(getConnectedIndices(9, cubes)).toEqual([]);
        expect(getConnectedIndices(10, cubes)).toEqual([]);
    });

    it('does not treat start of one row and end of previous row as adjacent (row wraparound right)', () => {
        const cubes: Cube[] = Array(100)
            .fill(null)
            .map(() => ({ color: null }));
        cubes[10] = { color: 'blue' }; // first col of second row
        cubes[9] = { color: 'blue' }; // last col of first row
        expect(getConnectedIndices(10, cubes)).toEqual([]);
        expect(getConnectedIndices(9, cubes)).toEqual([]);
    });

    it('includes vertically adjacent cubes in previous and next row (10x10 grid)', () => {
        const cubes: Cube[] = Array(100)
            .fill(null)
            .map(() => ({ color: null }));
        cubes[45] = { color: 'red' }; // center
        cubes[35] = { color: 'red' }; // above
        cubes[55] = { color: 'red' }; // below
        expect(getConnectedIndices(45, cubes).sort()).toEqual([35, 45, 55]);
        expect(getConnectedIndices(35, cubes).sort()).toEqual([35, 45, 55]);
        expect(getConnectedIndices(55, cubes).sort()).toEqual([35, 45, 55]);
    });

    it('does not include blocks of the wrong color or those separated by wrong color', () => {
        const cubes: Cube[] = Array(100)
            .fill(null)
            .map(() => ({ color: null }));
        cubes[0] = { color: 'red' };
        cubes[1] = { color: 'red' };
        cubes[2] = { color: 'blue' };
        cubes[3] = { color: 'red' };
        expect(getConnectedIndices(1, cubes).sort()).toEqual([0, 1]);
        expect(getConnectedIndices(3, cubes)).toEqual([]);
        expect(getConnectedIndices(2, cubes)).toEqual([]);
    });

    it('returns empty array for null-only board', () => {
        const cubes: Cube[] = Array(100)
            .fill(null)
            .map(() => ({ color: null }));
        expect(getConnectedIndices(0, cubes)).toEqual([]);
    });
});
