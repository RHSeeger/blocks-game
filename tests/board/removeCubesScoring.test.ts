// removeCubesScoring.test.ts
// Ensures that the score awarded by removeCubes matches calculateGroupScore for all group sizes.

import { calculateGroupScore } from '../../src/typescript/gamelogic/BoardState';
import { Cube } from '../../src/typescript/gamelogic/Cube';
import type { PlayerState } from '../../src/typescript/gamelogic/PlayerState';

// Import removeCubes from the bridge (not exported, so we need to test via handleCubeClick or refactor for testability)
// For now, duplicate the logic for test purposes, or refactor if needed.

import * as boardInteractions from '../../src/typescript/bridge/boardInteractions';

describe('removeCubes scoring', () => {
    // Helper to create a dummy player state
    function makePlayerState(): PlayerState {
        return {
            board: { cubes: [] } as any,
            totalScore: 0,
            boardScore: 0,
            maxBoardScore: 0,
            boardNumber: 1,
        };
    }

    it('awards correct score for various group sizes', () => {
        const { removeCubes } = boardInteractions as any;
        for (let size = 2; size <= 15; size++) {
            // Create a group of non-special cubes
            const cubesArr: Cube[] = Array.from({ length: size }, () => new Cube('red'));
            // Fill the rest of the board with empty cubes
            while (cubesArr.length < 100) cubesArr.push(new Cube(null));
            const playerState = makePlayerState();
            const groupIndices = Array.from({ length: size }, (_, i) => i);
            const result = removeCubes(cubesArr, playerState, groupIndices);
            const expected = calculateGroupScore(size);
            expect(result.groupScore).toBe(expected);
        }
    });

    it('ignores special cubes in scoring', () => {
        const { removeCubes } = boardInteractions as any;
        // 5 cubes, 2 are special
        const cubesArr: Cube[] = [
            new Cube('red'),
            new Cube('red', 'plus1'),
            new Cube('red'),
            new Cube('red', 'plus1'),
            new Cube('red'),
        ];
        while (cubesArr.length < 100) cubesArr.push(new Cube(null));
        const playerState = makePlayerState();
        const groupIndices = [0, 1, 2, 3, 4];
        const result = removeCubes(cubesArr, playerState, groupIndices);
        // Only 3 non-special cubes should count
        const expected = calculateGroupScore(3);
        expect(result.groupScore).toBe(expected);
    });
});
