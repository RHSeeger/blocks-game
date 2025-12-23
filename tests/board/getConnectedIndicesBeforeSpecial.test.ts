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
