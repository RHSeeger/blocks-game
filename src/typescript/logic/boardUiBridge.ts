import type { Cube } from '../Cube';
import type { PlayerState } from '../PlayerState';
import { handleCubeClick, handleUnselect, BoardInteractionResult } from './boardInteractions';
import { saveGameState } from '../initialization';
import { updatePlayerComponent } from '../ui/PlayerComponent';

/**
 * Called by the UI when a cube is clicked. Handles all game logic, state changes, saving, and UI updates.
 */
export function onCubeClicked(
    cubeIndex: number,
    cubesArr: Cube[],
    playerState: PlayerState,
    selectedIndices: number[],
    board: HTMLElement,
    gameState: any,
) {
    const result = handleCubeClick(cubeIndex, cubesArr, playerState, selectedIndices);
    if (result.type === 'remove') {
        // Update cubesArr and playerState in-place
        for (let j = 0; j < cubesArr.length; j++) {
            cubesArr[j].color = result.newCubes[j].color;
            if ('special' in result.newCubes[j]) {
                cubesArr[j].special = result.newCubes[j].special;
            } else {
                delete cubesArr[j].special;
            }
        }
        playerState.totalScore = result.newPlayerState.totalScore;
        playerState.boardScore = result.newPlayerState.boardScore;
        playerState.maxBoardScore = result.newPlayerState.maxBoardScore;
        playerState.selectedIndices = [];
        // Save and update UI
        gameState.humanPlayer.board.cubes = cubesArr;
        saveGameState(gameState);
        updatePlayerComponent(board, cubesArr, playerState);
    } else if (result.type === 'select') {
        playerState.selectedIndices = result.selectedIndices;
        updatePlayerComponent(board, cubesArr, playerState);
    } else if (result.type === 'unselect') {
        playerState.selectedIndices = [];
        updatePlayerComponent(board, cubesArr, playerState);
    } else if (result.type === 'none') {
        updatePlayerComponent(board, cubesArr, playerState);
    }
}

/**
 * Called by the UI when a click outside the board occurs (to unselect).
 */
export function onUnselect(board: HTMLElement, cubesArr: Cube[], playerState: PlayerState) {
    handleUnselect();
    playerState.selectedIndices = [];
    updatePlayerComponent(board, cubesArr, playerState);
}
