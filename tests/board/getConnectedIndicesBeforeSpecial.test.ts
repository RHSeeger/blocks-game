import { getConnectedIndicesBeforeSpecial } from '../../src/typescript/board';
import type { Cube } from '../../src/typescript/cube';

describe('getConnectedIndicesBeforeSpecial', () => {
    it('does not treat end of one row and start of next row as adjacent (row wraparound left)', () => {
        const cubes: Cube[] = Array(100)
            .fill(null)
            .map(() => ({ color: null }));
        cubes[9] = { color: 'red' }; // last col of first row
        cubes[10] = { color: 'red' }; // first col of second row
        expect(getConnectedIndicesBeforeSpecial(9, cubes)).toEqual([9]);
        expect(getConnectedIndicesBeforeSpecial(10, cubes)).toEqual([10]);
    });

    it('does not treat start of one row and end of previous row as adjacent (row wraparound right)', () => {
        const cubes: Cube[] = Array(100)
            .fill(null)
            .map(() => ({ color: null }));
        cubes[10] = { color: 'blue' }; // first col of second row
        cubes[9] = { color: 'blue' }; // last col of first row
        expect(getConnectedIndicesBeforeSpecial(10, cubes)).toEqual([10]);
        expect(getConnectedIndicesBeforeSpecial(9, cubes)).toEqual([9]);
    });

    it('includes vertically adjacent cubes in previous and next row (10x10 grid)', () => {
        const cubes: Cube[] = Array(100)
            .fill(null)
            .map(() => ({ color: null }));
        cubes[45] = { color: 'red' }; // center
        cubes[35] = { color: 'red' }; // above
        cubes[55] = { color: 'red' }; // below
        expect(getConnectedIndicesBeforeSpecial(45, cubes).sort()).toEqual([35, 45, 55]);
        expect(getConnectedIndicesBeforeSpecial(35, cubes).sort()).toEqual([35, 45, 55]);
        expect(getConnectedIndicesBeforeSpecial(55, cubes).sort()).toEqual([35, 45, 55]);
    });

    it('does not include blocks of the wrong color or those separated by wrong color', () => {
        const cubes: Cube[] = Array(100)
            .fill(null)
            .map(() => ({ color: null }));
        cubes[0] = { color: 'red' };
        cubes[1] = { color: 'red' };
        cubes[2] = { color: 'blue' };
        cubes[3] = { color: 'red' };
        expect(getConnectedIndicesBeforeSpecial(1, cubes).sort()).toEqual([0, 1]);
        expect(getConnectedIndicesBeforeSpecial(3, cubes)).toEqual([3]);
        expect(getConnectedIndicesBeforeSpecial(2, cubes)).toEqual([2]);
    });

    it('returns single index for isolated cube', () => {
        const cubes: Cube[] = Array(100)
            .fill(null)
            .map(() => ({ color: null }));
        cubes[0] = { color: 'red' };
        expect(getConnectedIndicesBeforeSpecial(0, cubes)).toEqual([0]);
    });

    it('returns both indices for 2 adjacent non-special cubes', () => {
        const cubes: Cube[] = Array(100)
            .fill(null)
            .map(() => ({ color: null }));
        cubes[0] = { color: 'red' };
        cubes[1] = { color: 'red' };
        expect(getConnectedIndicesBeforeSpecial(0, cubes).sort()).toEqual([0, 1]);
    });

    it('includes adjacent special block but only returns non-special indices', () => {
        const cubes: Cube[] = Array(100)
            .fill(null)
            .map(() => ({ color: null }));
        cubes[0] = { color: 'red' };
        cubes[1] = { color: null, special: 'plus1' };
        expect(getConnectedIndicesBeforeSpecial(0, cubes)).toEqual([0]);
    });

    it('handles edge cube with adjacent same color', () => {
        const cubes: Cube[] = Array(100)
            .fill(null)
            .map(() => ({ color: null }));
        cubes[9] = { color: 'blue' };
        cubes[8] = { color: 'blue' };
        expect(getConnectedIndicesBeforeSpecial(9, cubes).sort()).toEqual([8, 9]);
    });

    it('handles internal cube with multiple adjacent same color and specials', () => {
        const cubes: Cube[] = Array(100)
            .fill(null)
            .map(() => ({ color: null }));
        cubes[44] = { color: 'green' };
        cubes[45] = { color: 'green' };
        cubes[54] = { color: null, special: 'plus1' };
        cubes[34] = { color: 'green' };
        expect(getConnectedIndicesBeforeSpecial(44, cubes).sort()).toEqual([34, 44, 45]);
    });

    it('returns correct indices for a group with multiple specials', () => {
        const cubes: Cube[] = Array(100)
            .fill(null)
            .map(() => ({ color: null }));
        cubes[10] = { color: 'yellow' };
        cubes[11] = { color: null, special: 'plus1' };
        cubes[20] = { color: null, special: 'plus1' };
        cubes[21] = { color: 'yellow' };
        expect(getConnectedIndicesBeforeSpecial(10, cubes).sort()).toEqual([10]);
    });
});
