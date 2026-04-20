// handleCubeClickGroupSelection.test.ts
// Tests that handleCubeClick removes the originally selected group, not a new group based on a second click.

import { handleCubeClick } from '../../src/typescript/bridge/boardInteractions';
import { Cube } from '../../src/typescript/gamelogic/Cube';

globalThis.window = Object.create(window);

function makeGameStateWithRow(row: Cube[]) {
    return {
        humanPlayer: {
            board: { cubes: row.concat(Array(100 - row.length).fill(new Cube(null))) },
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
            new Cube('none', 'plus1'),
            new Cube('green'),
            new Cube('yellow'),
        ];
        const gameState = makeGameStateWithRow(row);
        // @ts-expect-error: window.gameState is not typed
        window.gameState = gameState;
        console.log('Visible row after creation:', gameState.humanPlayer.board.cubes.slice(0, 10).map((cube) => cube.color));

        // First click: select group by clicking R (index 3)
        handleCubeClick(3, 'human');
        // The selected group should include G, R, R, +1 (indices 2,3,4,5)
        const selected = gameState.humanPlayer.selectedIndices;
        console.log('Visible row after click:', gameState.humanPlayer.board.cubes.slice(0, 10).map((cube) => cube.color));
        console.log('Selected indices after first click:', selected);
        expect(selected.sort((a, b) => a - b)).toEqual([2, 3, 4, 5]);

        // Second click: click R (index 4, which is in the selection)
        handleCubeClick(4, 'human');
        // After removal and gravity, the first row should be empty
        const cubes = gameState.humanPlayer.board.cubes;
        const firstRow = cubes.slice(0, 10).map((cube) => cube.color);
        const lastRow = cubes.slice(90, 100).map((cube) => cube.color);
        console.log('First row after gravity:', firstRow);
        console.log('Last row after gravity:', lastRow);
        expect(firstRow).toEqual([null, null, null, null, null, null, null, null, null, null]);
        // The last row should contain the remaining cubes in original order (blue, green, yellow, null...)
        expect(lastRow).toEqual(['blue', 'green', 'green', 'yellow', null, null, null, null, null, null]);
    });
});
