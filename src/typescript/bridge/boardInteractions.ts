/**
 * Finds all valid group roots (indices) for a player: non-special, non-empty cubes that are part of a group of at least 2.
 * Returns an array of valid root indices.
 */
export function getAllValidGroupRoots(cubesArr: Cube[]): number[] {
    const validRoots: number[] = [];
    for (let i = 0; i < cubesArr.length; i++) {
        const cube = cubesArr[i];
        if (!cube.color || cube.special) continue;
        // Use getConnectedIndicesBeforeSpecial to check group size (must be >= 2)
        const groupIndices = getConnectedIndicesBeforeSpecial(i, cubesArr);
        if (groupIndices.length >= 2) {
            validRoots.push(i);
        }
    }
    return validRoots;
}
// boardInteractions.ts
// --------------------
// Handles user interactions with the board, such as cube clicks, and updates the game state
// accordingly.
//
import { Cube } from '../gamelogic/Cube';
import type { PlayerState } from '../gamelogic/PlayerState';
import {
    BoardState,
    getConnectedIndices,
    getConnectedIndicesBeforeSpecial,
    calculateGroupScore,
} from '../gamelogic/BoardState';
import { ALL_ACHIEVEMENTS } from '../achievements-list';
/**
 * Handles a click on a cube and makes all necessary changes to the game state.
 * Does not return anything. Reads and writes state from window.gameState.
 *
 * @param cubeIndex Index of the clicked cube
 * @param player 'human' or 'computer' - which player to act on
 */
export function handleCubeClick(cubeIndex: number, player: 'human' | 'computer'): void {
    // @ts-expect-error: window.gameState is not typed
    const gameState = window.gameState;
    const playerState = player === 'human' ? gameState.humanPlayer : gameState.computerPlayer;
    const cubesArr = playerState.board.cubes;
    const selectedIndices = playerState.selectedIndices || [];
    if (cubesArr[cubeIndex].special) return;
    const groupIndices = getConnectedIndices(cubeIndex, cubesArr);
    const groupIndicesBeforeSpecial = getConnectedIndicesBeforeSpecial(cubeIndex, cubesArr);
    if (selectedIndices.length > 0 && selectedIndices.includes(cubeIndex)) {
        // Remove the group currently under the cursor (actual group, not possibly stale selection)
        // Calculate preSpecialCubes BEFORE removal, using a copy of the cubes
        const preSpecialCubes: Cube[] = groupIndicesBeforeSpecial.map((idx: number) => ({ ...cubesArr[idx] }));
        const cubesToRemove: Cube[] = groupIndices.map((idx: number) => cubesArr[idx]);
        beforeRemoveCubes(playerState, cubesToRemove);
        const { newCubes, newPlayerState, groupScore } = removeCubes(cubesArr, playerState, groupIndices);
        if (player === 'human') {
            const numCubes = groupIndices.length;
            console.log(`Human removed ${numCubes} cubes for ${groupScore} points`);
        }
        // Replace the cubes array with new Cube instances (do not mutate in place)
        playerState.board.cubes = newCubes.map(cube => ({ ...cube }));
        playerState.totalScore = newPlayerState.totalScore;
        playerState.boardScore = newPlayerState.boardScore;
        playerState.maxBoardScore = newPlayerState.maxBoardScore;
        playerState.selectedIndices = [];
        afterRemoveCubes(playerState, cubesToRemove, preSpecialCubes);
        // Save game state
        // @ts-expect-error: window.gameState is not typed
        window.gameState = gameState;
        // Save to local storage
        // @ts-expect-error: saveGameState may not be globally available
        if (typeof saveGameState === 'function') saveGameState(gameState);
    } else {
        // Only allow selection if the group is valid (at least 2 non-special blocks)
        if (groupIndicesBeforeSpecial.length < 2) return;
        playerState.selectedIndices = groupIndices;
        // @ts-expect-error: window.gameState is not typed
        window.gameState = gameState;
    }
}

/**
 * Called before removing cubes from the board. (No-op for now.)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function beforeRemoveCubes(_: unknown, __: unknown): void {
    // Placeholder for future logic
}

/**
 * Removes the cubes at the given indices and returns the new cubes array and updated player state.
 *
 * TODO: Move this to `gamelogic` code
 */
export function removeCubes(
    cubesArr: Cube[],
    playerState: PlayerState,
    groupIndices: number[],
): { newCubes: Cube[]; newPlayerState: PlayerState; groupScore: number } {
    // Create a new array of Cubes, setting removed indices to blank (null)
    let blankedCubes = cubesArr.map((cube, idx) =>
        groupIndices.includes(idx)
            ? new Cube(null)
            : cube
    );
    // Apply gravity immutably
    const boardState = new BoardState(blankedCubes);
    boardState.applyGravity();
    const newCubes = [...boardState.cubes];
    const nonSpecialCount = groupIndices.filter((idx) => !cubesArr[idx].special).length;
    const groupScore = calculateGroupScore(nonSpecialCount);
    const newPlayerState = { ...playerState };
    newPlayerState.totalScore += groupScore;
    newPlayerState.boardScore += groupScore;
    if (newPlayerState.boardScore > newPlayerState.maxBoardScore) {
        newPlayerState.maxBoardScore = newPlayerState.boardScore;
    }
    return { newCubes, newPlayerState, groupScore };
}

/**
 * Called after removing cubes from the board. (No-op for now.)
 *
 * TODO: Move this to `gamelogic` code
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
/**
 * Called after removing cubes from the board.
 * @param playerState The player whose cubes were removed
 * @param cubesToRemove The cubes that were actually removed (after special expansion)
 * @param preSpecialCubes The cubes that were part of the selection before special expansion (non-specials only)
 */
function afterRemoveCubes(playerState: PlayerState, cubesToRemove: Cube[], preSpecialCubes: Cube[]): void {
    // @ts-expect-error: window.gameState is not typed
    const gameState = window.gameState;
    if (!(gameState && playerState === gameState.humanPlayer)) return;
    // Award 'no_not_like_that' achievement if the human player removes a group of exactly 2 non-special cubes with a +1 block connected
    if (!gameState || !gameState.humanPlayer || !gameState.accomplishedAchievements) return;
    if (playerState !== gameState.humanPlayer) return;
    const nonSpecialCount = preSpecialCubes.length;
    const hasPlus1 = cubesToRemove.some((cube: any) => cube.special === 'plus1');
    if (nonSpecialCount === 2 && hasPlus1) {
        const alreadyHas = gameState.accomplishedAchievements.some((a: any) => a.internalName === 'no_not_like_that');
        if (!alreadyHas) {
            const achievement = ALL_ACHIEVEMENTS.find((a: any) => a.internalName === 'no_not_like_that');
            if (achievement) {
                gameState.accomplishedAchievements.push(achievement);
            }
        }
    }
}

/**
 * Handles a click outside the selected group (unselects).
 */
// Removed handleUnselect, no longer needed
