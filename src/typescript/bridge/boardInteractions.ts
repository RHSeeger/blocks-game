// boardInteractions.ts
// --------------------
// Handles user interactions with the board, such as cube clicks, and updates the game state
// accordingly.
//
import type { Cube } from '../gamelogic/Cube';
import type { PlayerState } from '../gamelogic/PlayerState';
import { BoardState, getConnectedIndices, getConnectedIndicesBeforeSpecial } from '../gamelogic/BoardState';
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
    if (groupIndicesBeforeSpecial.length < 2) return;
    // If already selected, remove group
    if (selectedIndices.length > 0 && selectedIndices.includes(cubeIndex)) {
        // Prepare list of Cube objects to be removed
        const cubesToRemove: Cube[] = groupIndices.map((idx) => cubesArr[idx]);
        beforeRemoveCubes(playerState, cubesToRemove);
        const { newCubes, newPlayerState } = removeCubes(cubesArr, playerState, groupIndices);
        // Update cubesArr and playerState in-place
        for (let j = 0; j < cubesArr.length; j++) {
            cubesArr[j].color = newCubes[j].color;
            if ('special' in newCubes[j]) {
                cubesArr[j].special = newCubes[j].special;
            } else {
                delete cubesArr[j].special;
            }
        }
        playerState.totalScore = newPlayerState.totalScore;
        playerState.boardScore = newPlayerState.boardScore;
        playerState.maxBoardScore = newPlayerState.maxBoardScore;
        playerState.selectedIndices = [];
        afterRemoveCubes(playerState, cubesToRemove);
        // Save game state
        // @ts-expect-error: window.gameState is not typed
        window.gameState = gameState;
        // Save to local storage
        // @ts-expect-error: saveGameState may not be globally available
        if (typeof saveGameState === 'function') saveGameState(gameState);
    } else {
        // Select group
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
 */
function removeCubes(
    cubesArr: Cube[],
    playerState: PlayerState,
    groupIndices: number[],
): { newCubes: Cube[]; newPlayerState: PlayerState; groupScore: number } {
    const boardState = new BoardState([...cubesArr]);
    groupIndices.forEach((idx) => {
        boardState.cubes[idx].color = null;
        if (boardState.cubes[idx].special) delete boardState.cubes[idx].special;
    });
    boardState.applyGravity();
    const newCubes = [...boardState.cubes];
    const nonSpecialCount = groupIndices.filter((idx) => !cubesArr[idx].special).length;
    const groupScore = nonSpecialCount; // Use your scoring logic if needed
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
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function afterRemoveCubes(_: unknown, __: unknown): void {
    // Placeholder for future logic
}

/**
 * Handles a click outside the selected group (unselects).
 */
// Removed handleUnselect, no longer needed
