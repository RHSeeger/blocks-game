// Removed direct import from gamelogic. All logic must go through bridge or be handled externally.

/**
 * Creates and attaches the Next Board button for the human player area.
 * Moves to the next board and updates the UI and state.
 */
export function createNextBoardButton(
    board: HTMLElement,
    cubesArr: CubeView[],
    unlockedUnlocks: { internalName: string }[],
    playerState: PlayerStateView,
    onBoardAdvance: (newCubes: CubeView[], newBoardNumber: number) => void,
) {
    let btn = document.getElementById('next-board-btn') as HTMLButtonElement | null;
    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'next-board-btn';
        btn.textContent = 'Next Board';
        // Place button after the board, inside the human-area
        const humanArea = document.getElementById('human-area');
        if (humanArea) {
            humanArea.appendChild(btn);
        } else {
            board.parentElement?.appendChild(btn);
        }
    }
    btn.onclick = () => {
        // UI does not generate new cubes or mutate state. Delegate to bridge/game logic.
        board.classList.remove('inactive');
        btn.remove();
        onBoardAdvance([], playerState.boardNumber + 1); // Let bridge/game logic handle new cubes and state
    };
}
/**
 * PlayerComponent.ts
 * Handles updating the player area, including the board and player info (score, etc).
 */
import type { PlayerStateView } from '../bridge/PlayerStateView';
import type { CubeView } from '../bridge/CubeView';
import { updateBoard, attachBoardInteractions } from './BoardComponent';

/**
 * Updates the player component area, including the board and player info.
 * @param board The board HTMLElement to update
 * @param cubesArr The array of cubes representing the board state
 * @param playerState The PlayerState for this player
 */
/**
 * Updates the player component area, including the board and player info.
 * @param board The board HTMLElement to update
 * @param cubesArr The array of cubes representing the board state
 * @param playerState The PlayerState for this player
 */
export function updatePlayerComponent(board: HTMLElement, cubesArr: CubeView[], playerState: PlayerStateView): void {
    updateBoard(board, cubesArr);
    // Update player info (score, etc)
    let scoreDisplay: HTMLElement | null = null;
    if (board.id === 'human-board') {
        scoreDisplay = document.getElementById('human-score');
        // Attach click/group logic for the human board
        attachBoardInteractions(board, cubesArr, playerState);
        // Show Next Board button if no more valid groups
        if (playerState.board.isBoardFinished()) {
            // The callback should be provided by the bridge/logic layer. Here, just emit an event.
            createNextBoardButton(
                board,
                cubesArr,
                [], // unlockedUnlocks not needed for button display
                playerState,
                (newCubes, newBoardNumber) => {
                    // UI does not mutate state. Emit event for bridge/logic to handle.
                    const event = new CustomEvent('nextBoardRequested', {
                        detail: { newCubes, newBoardNumber },
                    });
                    window.dispatchEvent(event);
                },
            );
        }
    } else if (board.id === 'computer-board') {
        scoreDisplay = document.getElementById('computer-score');
    }
    if (scoreDisplay && playerState) {
        scoreDisplay.textContent = (typeof playerState.totalScore === 'number' ? playerState.totalScore : 0).toString();
    }
    // Add more player info updates here as needed
}
