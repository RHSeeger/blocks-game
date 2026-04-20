// handleCubeClickGroupSelection.test.ts
// Tests that handleCubeClick removes the originally selected group, not a new group based on a second click.

import { handleCubeClick } from '../../src/typescript/bridge/boardInteractions';
import { Cube } from '../../src/typescript/gamelogic/Cube';

globalThis.window = Object.create(window);

function makeGameStateWithRow(row: Cube[]) {
    return {
        humanPlayer: {
            board: { cubes: row.concat(Array.from({ length: 100 - row.length }, () => new Cube(null))) },
            totalScore: 0,
            boardScore: 0,
            maxBoardScore: 0,
            boardNumber: 1,
            selectedIndices: [],
        },
        computerPlayer: {},
        unlockedUnlocks: [],
    };
}

describe('handleCubeClick group selection and removal', () => {
    it('removes the originally selected group, not a new group based on a second click', () => {
        // B, G, G, R, R, +1, G, Y
        // Click R (index 3), then click R (index 4, which is in the selection)
        const row = [
            new Cube('blue'),
            new Cube('green'),
            new Cube('green'),
            new Cube('red'),
            new Cube('red'),
            new Cube(null, 'plus1'),
            new Cube('green'),
            new Cube('yellow'),
        ];
        const gameState = makeGameStateWithRow(row);
        // @ts-expect-error: window.gameState is not typed
        window.gameState = gameState;

        // First click: select group by clicking R (index 3)
        handleCubeClick(3, 'human');
        // The selected group should include G, R, R, +1 (indices 2,3,4,5)
        const selected = gameState.humanPlayer.selectedIndices;
        expect(selected.sort((a, b) => a - b)).toEqual([2, 3, 4, 5]);

        // Second click: click R (index 4, which is in the selection)
        handleCubeClick(4, 'human');
        // After removal and gravity, the first row should be empty
        const cubes = gameState.humanPlayer.board.cubes;
        const firstRow = cubes.slice(0, 10).map((cube) => cube.color);
        const lastRow = cubes.slice(90, 100).map((cube) => cube.color);
        // Debug: print all non-null cubes and their positions after gravity
        const nonNullCubes = gameState.humanPlayer.board.cubes
            .map((cube: any, idx: number) => ({ idx, color: cube.color, special: cube.special }))
            .filter((c: { color: string | null; special?: string }) => c.color !== null || c.special);
        expect(firstRow).toEqual([null, null, null, null, null, null, null, null, null, null]);
        // The last row should contain the remaining cubes in original order (blue, green, yellow, null...)
        expect(lastRow).toEqual(['blue', 'green', 'green', 'yellow', null, null, null, null, null, null]);
    });
});
