// computerTurn.ts
// --------------
// Implements the computer player's turn logic for the game.

import { getAllValidGroupRoots } from '../bridge/boardInteractions';
import { handleCubeClick } from '../bridge/boardInteractions';
import type { GameState } from '../GameState';
import { notifyUiGameStateChanged } from '../bridge/boardUiBridge';
import { advanceComputerToNextBoard } from './advanceComputerToNextBoard';

/**
 * Handles the computer player's turn: selects or removes a group as appropriate.
 * Updates game state and notifies the UI via the bridge.
 */
export function computerTurn(gameState: GameState): void {
    const computer = gameState.computerPlayer;
    const cubesArr = computer.board.cubes;
    const selectedIndices = computer.selectedIndices || [];
    if (selectedIndices.length === 0) {
        // No selection: pick a random valid group root and select it
        const validRoots = getAllValidGroupRoots(cubesArr);
        if (validRoots.length === 0) {
            // No valid groups: advance to next board
            advanceComputerToNextBoard(gameState);
            notifyUiGameStateChanged('computer');
            return;
        }
        const rootIdx = validRoots[Math.floor(Math.random() * validRoots.length)];
        handleCubeClick(rootIdx, 'computer');
    } else {
        // Already selected: click again to remove the group
        handleCubeClick(selectedIndices[0], 'computer');
    }
    // Notify UI to update
    notifyUiGameStateChanged('computer');
}
