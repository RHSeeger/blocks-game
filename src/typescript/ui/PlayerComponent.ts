import { getInitialCubes } from '../board';

/**
 * Creates and attaches the Next Board button for the human player area.
 * Moves to the next board and updates the UI and state.
 */
export function createNextBoardButton(
    board: HTMLElement,
    cubesArr: Cube[],
    unlockedUnlocks: { internalName: string }[],
    playerState: PlayerState,
    onBoardAdvance: (newCubes: Cube[], newBoardNumber: number) => void,
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
        // Generate new cubes using getInitialCubes to ensure special block logic
        const newCubes = getInitialCubes('player', unlockedUnlocks);
        for (let i = 0; i < cubesArr.length; i++) {
            cubesArr[i].color = newCubes[i].color;
            cubesArr[i].special = newCubes[i].special;
        }
        board.classList.remove('inactive');
        btn.remove();
        onBoardAdvance(newCubes, playerState.boardNumber + 1);
        // Use PlayerComponent to update the UI after advancing the board
        updatePlayerComponent(board, cubesArr, playerState);
    };
}
/**
 * PlayerComponent.ts
 * Handles updating the player area, including the board and player info (score, etc).
 */
import type { PlayerState } from '../playerState';
import type { Cube } from '../cube';
import { updateBoard, attachBoardInteractions } from './BoardComponent';
import { isBoardFinished } from '../board';

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
        // Show Next Board button if no more valid groups
        const gameState = (window as any).gameState;
        const { unlockedUnlocks } = gameState;
        if (isBoardFinished(cubesArr)) {
            createNextBoardButton(board, cubesArr, unlockedUnlocks, playerState, (newCubes, newBoardNumber) => {
                playerState.boardNumber = newBoardNumber;
                playerState.boardScore = 0;
                gameState.humanPlayer.board.cubes = newCubes;
                updatePlayerComponent(board, newCubes, playerState);
            });
        }
    } else if (board.id === 'computer-board') {
        scoreDisplay = document.getElementById('computer-score');
    }
    if (scoreDisplay && playerState) {
        scoreDisplay.textContent = (typeof playerState.totalScore === 'number' ? playerState.totalScore : 0).toString();
    }
    // Add more player info updates here as needed
}
