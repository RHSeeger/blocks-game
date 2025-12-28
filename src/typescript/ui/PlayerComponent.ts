/**
 * PlayerComponent.ts
 * Handles updating the player area, including the board and player info (score, etc).
 */
import type { PlayerState } from '../playerState';
import type { Cube } from '../cube';
import { updateBoard, attachBoardInteractions } from './BoardComponent';

/**
 * Updates the player component area, including the board and player info.
 * @param board The board HTMLElement to update
 * @param cubesArr The array of cubes representing the board state
 * @param playerState The PlayerState for this player
 */
export function updatePlayerComponent(board: HTMLElement, cubesArr: Cube[], playerState: PlayerState): void {
    updateBoard(board, cubesArr);
    // Update player info (score, etc)
    let scoreDisplay: HTMLElement | null = null;
    if (board.id === 'human-board') {
        scoreDisplay = document.getElementById('human-score');
        // Attach click/group logic for the human board
        // @ts-expect-error: window.gameState is set at runtime
        attachBoardInteractions(board, cubesArr, playerState, window.gameState);
    } else if (board.id === 'computer-board') {
        scoreDisplay = document.getElementById('computer-score');
    }
    if (scoreDisplay && playerState) {
        scoreDisplay.textContent = (typeof playerState.totalScore === 'number' ? playerState.totalScore : 0).toString();
    }
    // Add more player info updates here as needed
}
