import type { Cube } from '../Cube';
import type { PlayerState } from '../PlayerState';
import { BoardState, getConnectedIndices, getConnectedIndicesBeforeSpecial, isBoardFinished } from '../BoardState';

/**
 * Handles the logic for when a player clicks a cube on the board.
 * Returns an object describing what should be updated in the UI.
 */
export type BoardInteractionResult =
    | { type: 'none' }
    | { type: 'select'; selectedIndices: number[]; groupScore: number }
    | { type: 'unselect' }
    | { type: 'remove'; newCubes: Cube[]; newPlayerState: PlayerState; boardFinished: boolean };

/**
 * Handles a click on a cube and returns the result for the UI to render.
 *
 * @param cubeIndex Index of the clicked cube
 * @param cubesArr The current cubes array
 * @param playerState The current player state
 * @param selectedIndices The currently selected indices
 */
export function handleCubeClick(
    cubeIndex: number,
    cubesArr: Cube[],
    playerState: PlayerState,
    selectedIndices: number[],
): BoardInteractionResult {
    if (cubesArr[cubeIndex].special) return { type: 'none' };
    const groupIndices = getConnectedIndices(cubeIndex, cubesArr);
    const groupIndicesBeforeSpecial = getConnectedIndicesBeforeSpecial(cubeIndex, cubesArr);
    if (groupIndicesBeforeSpecial.length < 2) return { type: 'none' };
    // If already selected, remove group
    if (selectedIndices.length > 0 && selectedIndices.includes(cubeIndex)) {
        // Remove group
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
        const boardFinished = isBoardFinished(newCubes);
        return { type: 'remove', newCubes, newPlayerState, boardFinished };
    } else {
        // Select group
        const nonSpecialCount = groupIndices.filter((idx) => !cubesArr[idx].special).length;
        return { type: 'select', selectedIndices: groupIndices, groupScore: nonSpecialCount };
    }
}

/**
 * Handles a click outside the selected group (unselects).
 */
export function handleUnselect(): BoardInteractionResult {
    return { type: 'unselect' };
}
