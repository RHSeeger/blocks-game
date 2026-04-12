// Example unit test for BoardState.getConnectedIndices
import { getConnectedIndices } from '../../src/typescript/BoardState';
const { Cube } = require('../../src/typescript/Cube');

describe('getConnectedIndices', () => {
    it('returns all indices of a simple 2-block group', () => {
        const cubes: any[] = Array(100)
            .fill(null)
            .map(() => new Cube(null));
        cubes[0] = new Cube('red');
        cubes[1] = new Cube('red');
        expect(getConnectedIndices(0, cubes).sort()).toEqual([0, 1]);
    });

    it('does not treat end of one row and start of next row as adjacent (row wraparound left)', () => {
        const cubes: any[] = Array(100)
            .fill(null)
            .map(() => new Cube(null));
        cubes[9] = new Cube('red'); // last col of first row
        cubes[10] = new Cube('red'); // first col of second row
        expect(getConnectedIndices(9, cubes)).toEqual([]);
        expect(getConnectedIndices(10, cubes)).toEqual([]);
    });

    it('does not treat start of one row and end of previous row as adjacent (row wraparound right)', () => {
        const cubes: any[] = Array(100)
            .fill(null)
            .map(() => new Cube(null));
        cubes[10] = new Cube('blue'); // first col of second row
        cubes[9] = new Cube('blue'); // last col of first row
        expect(getConnectedIndices(10, cubes)).toEqual([]);
        expect(getConnectedIndices(9, cubes)).toEqual([]);
    });

    it('includes vertically adjacent cubes in previous and next row (10x10 grid)', () => {
        const cubes: any[] = Array(100)
            .fill(null)
            .map(() => new Cube(null));
        cubes[45] = new Cube('red'); // center
        cubes[35] = new Cube('red'); // above
        cubes[55] = new Cube('red'); // below
        expect(getConnectedIndices(45, cubes).sort()).toEqual([35, 45, 55]);
        expect(getConnectedIndices(35, cubes).sort()).toEqual([35, 45, 55]);
        expect(getConnectedIndices(55, cubes).sort()).toEqual([35, 45, 55]);
    });

    it('does not include blocks of the wrong color or those separated by wrong color', () => {
        const cubes: any[] = Array(100)
            .fill(null)
            .map(() => new Cube(null));
        cubes[0] = new Cube('red');
        cubes[1] = new Cube('red');
        cubes[2] = new Cube('blue');
        cubes[3] = new Cube('red');
        expect(getConnectedIndices(1, cubes).sort()).toEqual([0, 1]);
        expect(getConnectedIndices(3, cubes)).toEqual([]);
        expect(getConnectedIndices(2, cubes)).toEqual([]);
    });

    it('returns empty array for null-only board', () => {
        const cubes: any[] = Array(100)
            .fill(null)
            .map(() => new Cube(null));
        expect(getConnectedIndices(0, cubes)).toEqual([]);
    });
});
