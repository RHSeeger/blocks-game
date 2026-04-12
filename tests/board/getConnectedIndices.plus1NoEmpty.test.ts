import { getConnectedIndices } from '../../src/typescript/gamelogic/BoardState';
import { Cube } from '../../src/typescript/gamelogic/Cube';

describe('getConnectedIndices with +1 special block', () => {
    it('should not include empty spots when expanding with +1 special', () => {
        // 3x3 board for simplicity, flattened to 1D
        // Layout:
        // [ R, +1, null ]
        // [ R,  R,  R  ]
        // [ R,  R,  R  ]
        // +1 is at index 1, null (empty) at index 2
        // ...existing code...
        const cubes: Cube[] = [
            new Cube('red'),
            new Cube('grey', 'plus1'),
            new Cube(null),
            new Cube('red'),
            new Cube('red'),
            new Cube('red'),
            new Cube('red'),
            new Cube('red'),
            new Cube('red'),
        ];
        // Select the red at index 0, which is connected to the +1 at index 1
        const indices = getConnectedIndices(0, cubes);
        // The +1 should expand to its 8 neighbors, but should NOT include index 2 (which is empty)
        expect(indices).not.toContain(2);
    });
});
