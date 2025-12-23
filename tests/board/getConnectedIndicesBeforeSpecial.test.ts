      it('does not treat end of one row and start of next row as adjacent (row wraparound left)', () => {
        // Arrange: 10x10 grid, test that (row 0, col 9) is not adjacent to (row 1, col 0)
        const cubes: Cube[] = Array(100).fill(null).map(() => ({ color: null }));
        cubes[9] = { color: 'red' };   // last col of first row
        cubes[10] = { color: 'red' };  // first col of second row
        // Starting from 9 should only include itself
        expect(getConnectedIndicesBeforeSpecial(9, cubes)).toEqual([9]);
        // Starting from 10 should only include itself
        expect(getConnectedIndicesBeforeSpecial(10, cubes)).toEqual([10]);
      });

      it('does not treat start of one row and end of previous row as adjacent (row wraparound right)', () => {
        // Arrange: 10x10 grid, test that (row 1, col 0) is not adjacent to (row 0, col 9)
        const cubes: Cube[] = Array(100).fill(null).map(() => ({ color: null }));
        cubes[10] = { color: 'blue' }; // first col of second row
        cubes[9] = { color: 'blue' };  // last col of first row
        // Starting from 10 should only include itself
        expect(getConnectedIndicesBeforeSpecial(10, cubes)).toEqual([10]);
        // Starting from 9 should only include itself
        expect(getConnectedIndicesBeforeSpecial(9, cubes)).toEqual([9]);
      });
    it('includes vertically adjacent cubes in previous and next row (10x10 grid)', () => {
      // Arrange: 10x10 grid, test vertical adjacency
      // Place red at (row 4, col 5), (row 3, col 5), (row 5, col 5)
      // Indexing: idx = row * 10 + col
      const cubes: Cube[] = Array(100).fill(null).map(() => ({ color: null }));
      cubes[45] = { color: 'red' }; // center
      cubes[35] = { color: 'red' }; // above
      cubes[55] = { color: 'red' }; // below
      // Only these three should be included when starting from center
      expect(getConnectedIndicesBeforeSpecial(45, cubes).sort()).toEqual([35, 45, 55]);
      // Starting from above should include above and center and below
      expect(getConnectedIndicesBeforeSpecial(35, cubes).sort()).toEqual([35, 45, 55]);
      // Starting from below should include below and center and above
      expect(getConnectedIndicesBeforeSpecial(55, cubes).sort()).toEqual([35, 45, 55]);
    });
  it('does not include blocks of the wrong color or those separated by wrong color', () => {
    // Arrange: [red, red, blue, red], start at index 1 (second red)
    const cubes: Cube[] = Array(100).fill(null).map(() => ({ color: null }));
    cubes[0] = { color: 'red' };
    cubes[1] = { color: 'red' };
    cubes[2] = { color: 'blue' };
    cubes[3] = { color: 'red' };
    // Only the first two reds are connected; blue blocks the last red
    expect(getConnectedIndicesBeforeSpecial(1, cubes).sort()).toEqual([0, 1]);
    // Starting at the last red should only include itself
    expect(getConnectedIndicesBeforeSpecial(3, cubes)).toEqual([3]);
    // Starting at blue should only include itself
    expect(getConnectedIndicesBeforeSpecial(2, cubes)).toEqual([2]);
  });
import { getConnectedIndicesBeforeSpecial } from '../../src/typescript/board';
import type { Cube } from '../../src/typescript/cube';

describe('getConnectedIndicesBeforeSpecial', () => {
  it('returns single index for isolated cube', () => {
    const cubes: Cube[] = Array(100).fill(null).map(() => ({ color: null }));
    cubes[0] = { color: 'red' };
    expect(getConnectedIndicesBeforeSpecial(0, cubes)).toEqual([0]);
  });

  it('returns both indices for 2 adjacent non-special cubes', () => {
    const cubes: Cube[] = Array(100).fill(null).map(() => ({ color: null }));
    cubes[0] = { color: 'red' };
    cubes[1] = { color: 'red' };
    expect(getConnectedIndicesBeforeSpecial(0, cubes).sort()).toEqual([0, 1]);
  });

  it('includes adjacent special block but only returns non-special indices', () => {
    const cubes: Cube[] = Array(100).fill(null).map(() => ({ color: null }));
    cubes[0] = { color: 'red' };
    cubes[1] = { color: null, special: 'plus1' };
    expect(getConnectedIndicesBeforeSpecial(0, cubes)).toEqual([0]);
  });

  it('handles edge cube with adjacent same color', () => {
    const cubes: Cube[] = Array(100).fill(null).map(() => ({ color: null }));
    cubes[9] = { color: 'blue' };
    cubes[8] = { color: 'blue' };
    expect(getConnectedIndicesBeforeSpecial(9, cubes).sort()).toEqual([8, 9]);
  });

  it('handles internal cube with multiple adjacent same color and specials', () => {
    const cubes: Cube[] = Array(100).fill(null).map(() => ({ color: null }));
    cubes[44] = { color: 'green' };
    cubes[45] = { color: 'green' };
    cubes[54] = { color: null, special: 'plus1' };
    cubes[34] = { color: 'green' };
    expect(getConnectedIndicesBeforeSpecial(44, cubes).sort()).toEqual([34, 44, 45]);
  });

  it('returns correct indices for a group with multiple specials', () => {
    const cubes: Cube[] = Array(100).fill(null).map(() => ({ color: null }));
    cubes[10] = { color: 'yellow' };
    cubes[11] = { color: null, special: 'plus1' };
    cubes[20] = { color: null, special: 'plus1' };
    cubes[21] = { color: 'yellow' };
    expect(getConnectedIndicesBeforeSpecial(10, cubes).sort()).toEqual([10]);
  });
});
