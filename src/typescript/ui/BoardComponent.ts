import { isBoardFinished } from '../gamelogic/BoardState';
import type { PlayerState } from '../gamelogic/PlayerState';
import type { Cube } from '../gamelogic/Cube';
import { onCubeClicked, onUnselect } from '../bridge/boardUiBridge';

/**
 * Updates only the board grid display in the DOM for the given board element and cubes array.
 * Does not update any player info, score, or other UI elements.
 * @param board The board HTMLElement to update
 * @param cubesArr The array of cubes representing the board state
 */
export function updateBoard(board: HTMLElement, cubesArr: Cube[]): void {
    if (!board) return;
    board.innerHTML = '';
    // Remove any existing overlay
    const oldOverlay = board.querySelector('.board-complete-overlay');
    if (oldOverlay) oldOverlay.remove();
    for (let i = 0; i < 100; i++) {
        const cubeDiv = document.createElement('div');
        cubeDiv.className = 'cube';
        if (cubesArr[i].special === 'plus1') {
            cubeDiv.style.setProperty('--cube-color', 'grey');
            cubeDiv.textContent = '+1';
            cubeDiv.style.color = '#fff';
            cubeDiv.style.fontWeight = 'bold';
            cubeDiv.style.fontSize = '1.1em';
            cubeDiv.style.display = 'flex';
            cubeDiv.style.alignItems = 'center';
            cubeDiv.style.justifyContent = 'center';
        } else {
            cubeDiv.style.setProperty('--cube-color', cubesArr[i]?.color || '#fff');
        }
        if (cubesArr[i].color === null) {
            cubeDiv.style.opacity = '0.2';
            cubeDiv.style.pointerEvents = 'none';
        }
        board.appendChild(cubeDiv);
    }
    // Add overlay if board is finished
    if (isBoardFinished(cubesArr)) {
        const overlay = document.createElement('div');
        overlay.className = 'board-complete-overlay';
        overlay.textContent = 'Board Complete!';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.background = 'rgba(0,0,0,0.5)';
        overlay.style.color = '#fff';
        overlay.style.fontSize = '2em';
        overlay.style.zIndex = '10';
        overlay.style.pointerEvents = 'none';
        board.style.position = 'relative';
        board.appendChild(overlay);
    }
}

/**
 * Attaches click and group logic to the board for the human player.
 * @param board The board HTMLElement
 * @param cubesArr The array of cubes representing the board state
 * @param playerState The PlayerState for this player
 * @param gameState The full GameState object
 */
export function attachBoardInteractions(
    board: HTMLElement,
    cubesArr: Cube[],
    playerState: PlayerState,
    gameState: any,
) {
    const cubeDivs = Array.from(board.querySelectorAll('.cube')) as HTMLDivElement[];
    // Use selectedIndices from playerState, or initialize if missing
    if (!playerState.selectedIndices) playerState.selectedIndices = [];
    // Highlight selected cubes
    cubeDivs.forEach((div, idx) => {
        if (playerState.selectedIndices!.includes(idx)) {
            div.classList.add('selected');
        } else {
            div.classList.remove('selected');
        }
    });
    cubeDivs.forEach((cubeDiv, i) => {
        cubeDiv.addEventListener('click', (event) => {
            event.stopPropagation();
            onCubeClicked(i, 'human', board);
        });
    });
    document.addEventListener('click', function handleDocClick(event) {
        if (cubeDivs.some((div) => div.classList.contains('selected'))) {
            const target = event.target as HTMLElement;
            if (!target.classList.contains('selected')) {
                onUnselect();
            }
        }
    });
}
