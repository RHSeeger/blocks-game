import { getConnectedIndicesBeforeSpecial } from '../../src/typescript/gamelogic/BoardState';
import { Cube } from '../../src/typescript/gamelogic/Cube';

describe('getConnectedIndicesBeforeSpecial', () => {
    it('does not treat end of one row and start of next row as adjacent (row wraparound left)', () => {
        // ...existing code...
        const cubes: any[] = Array(100)
            .fill(null)
            .map(() => new Cube(null));
        cubes[9] = new Cube('red'); // last col of first row
        cubes[10] = new Cube('red'); // first col of second row
        expect(getConnectedIndicesBeforeSpecial(9, cubes)).toEqual([9]);
        expect(getConnectedIndicesBeforeSpecial(10, cubes)).toEqual([10]);
    });

    it('does not treat start of one row and end of previous row as adjacent (row wraparound right)', () => {
        const cubes: any[] = Array(100)
            .fill(null)
            .map(() => new Cube(null));
        cubes[10] = new Cube('blue'); // first col of second row
        cubes[9] = new Cube('blue'); // last col of first row
        expect(getConnectedIndicesBeforeSpecial(10, cubes)).toEqual([10]);
        expect(getConnectedIndicesBeforeSpecial(9, cubes)).toEqual([9]);
    });

    it('includes vertically adjacent cubes in previous and next row (10x10 grid)', () => {
        const cubes: any[] = Array(100)
            .fill(null)
            .map(() => new Cube(null));
        cubes[45] = new Cube('red'); // center
        cubes[35] = new Cube('red'); // above
        cubes[55] = new Cube('red'); // below
        expect(getConnectedIndicesBeforeSpecial(45, cubes).sort()).toEqual([35, 45, 55]);
        expect(getConnectedIndicesBeforeSpecial(35, cubes).sort()).toEqual([35, 45, 55]);
        expect(getConnectedIndicesBeforeSpecial(55, cubes).sort()).toEqual([35, 45, 55]);
    });

    it('does not include blocks of the wrong color or those separated by wrong color', () => {
        const cubes: any[] = Array(100)
            .fill(null)
            .map(() => new Cube(null));
        cubes[0] = new Cube('red');
        cubes[1] = new Cube('red');
        cubes[2] = new Cube('blue');
        cubes[3] = new Cube('red');
        expect(getConnectedIndicesBeforeSpecial(1, cubes).sort()).toEqual([0, 1]);
        expect(getConnectedIndicesBeforeSpecial(3, cubes)).toEqual([3]);
        expect(getConnectedIndicesBeforeSpecial(2, cubes)).toEqual([2]);
    });

    it('returns single index for isolated cube', () => {
        const cubes: any[] = Array(100)
            .fill(null)
            .map(() => new Cube(null));
        cubes[0] = new Cube('red');
        expect(getConnectedIndicesBeforeSpecial(0, cubes)).toEqual([0]);
    });

    it('returns both indices for 2 adjacent non-special cubes', () => {
        const cubes: any[] = Array(100)
            .fill(null)
            .map(() => new Cube(null));
        cubes[0] = new Cube('red');
        cubes[1] = new Cube('red');
        expect(getConnectedIndicesBeforeSpecial(0, cubes).sort()).toEqual([0, 1]);
    });

    it('includes adjacent special block but only returns non-special indices', () => {
        const cubes: any[] = Array(100)
            .fill(null)
            .map(() => new Cube(null));
        cubes[0] = new Cube('red');
        cubes[1] = new Cube(null, 'plus1');
        expect(getConnectedIndicesBeforeSpecial(0, cubes)).toEqual([0]);
    });

    it('handles edge cube with adjacent same color', () => {
        const cubes: any[] = Array(100)
            .fill(null)
            .map(() => new Cube(null));
        cubes[9] = new Cube('blue');
        cubes[8] = new Cube('blue');
        expect(getConnectedIndicesBeforeSpecial(9, cubes).sort()).toEqual([8, 9]);
    });

    it('handles internal cube with multiple adjacent same color and specials', () => {
        const cubes: any[] = Array(100)
            .fill(null)
            .map(() => new Cube(null));
        cubes[44] = new Cube('green');
        cubes[45] = new Cube('green');
        cubes[54] = new Cube(null, 'plus1');
        cubes[34] = new Cube('green');
        expect(getConnectedIndicesBeforeSpecial(44, cubes).sort()).toEqual([34, 44, 45]);
    });

    it('returns correct indices for a group with multiple specials', () => {
        const cubes: any[] = Array(100)
            .fill(null)
            .map(() => new Cube(null));
        cubes[10] = new Cube('yellow');
        cubes[11] = new Cube(null, 'plus1');
        cubes[20] = new Cube(null, 'plus1');
        cubes[21] = new Cube('yellow');
        expect(getConnectedIndicesBeforeSpecial(10, cubes).sort()).toEqual([10]);
    });
});
