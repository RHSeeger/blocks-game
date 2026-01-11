// Example unit test for BoardState.getConnectedIndices
import { getConnectedIndices } from '../../src/typescript/board';
import type { Cube } from '../../src/typescript/cube';

describe('getConnectedIndices', () => {
    it('returns all indices of a simple 2-block group', () => {
        // Arrange: 2x1 group of color 'red' at 0, 1; rest null
        const cubes: Cube[] = Array(100)
            .fill(null)
            .map(() => ({ color: null }));
        cubes[0] = { color: 'red' };
        cubes[1] = { color: 'red' };
        // Act
        const group = getConnectedIndices(0, cubes);
        // Assert
        expect(group.sort()).toEqual([0, 1]);
    });
});
