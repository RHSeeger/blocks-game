import type { BoardStateView } from '../bridge/BoardStateView';
import type { PlayerStateView } from '../bridge/PlayerStateView';
import type { CubeView } from '../bridge/CubeView';
import { onCubeClicked, onUnselect } from '../bridge/boardUiBridge';

/**
 * Updates only the board grid display in the DOM for the given board element and cubes array.
 * Does not update any player info, score, or other UI elements.
 * @param board The board HTMLElement to update
 * @param cubesArr The array of cubes representing the board state
 */
export function updateBoard(board: HTMLElement, cubesArr: CubeView[]): void {
    if (!board) return;
    board.innerHTML = '';
    // Remove any existing overlay
    const oldOverlay = board.querySelector('.board-complete-overlay');
    if (oldOverlay) oldOverlay.remove();
    for (let i = 0; i < 100; i++) {
        const cubeDiv = document.createElement('div');
        cubeDiv.className = 'cube';
        if (cubesArr[i].getSpecial && cubesArr[i].getSpecial() === 'plus1') {
            cubeDiv.style.setProperty('--cube-color', 'grey');
            cubeDiv.textContent = '+1';
            cubeDiv.style.color = '#fff';
            cubeDiv.style.fontWeight = 'bold';
            cubeDiv.style.fontSize = '1.1em';
            cubeDiv.style.display = 'flex';
            cubeDiv.style.alignItems = 'center';
            cubeDiv.style.justifyContent = 'center';
        } else {
            cubeDiv.style.setProperty('--cube-color', cubesArr[i]?.getColor() || '#fff');
        }
        if (cubesArr[i].getColor() === null) {
            cubeDiv.style.opacity = '0.2';
            cubeDiv.style.pointerEvents = 'none';
        }
        board.appendChild(cubeDiv);
    }
    // Overlay logic should be handled by bridge/game logic if needed
}

/**
 * Attaches click and group logic to the board for the human player.
 * @param board The board HTMLElement
 * @param cubesArr The array of cubes representing the board state
 * @param playerState The PlayerState for this player
 * @param gameState The full GameState object
 */
export function attachBoardInteractions(board: HTMLElement, cubesArr: CubeView[], playerState: PlayerStateView) {
    const cubeDivs = Array.from(board.querySelectorAll('.cube')) as HTMLDivElement[];
    // Highlight selected cubes (read-only)
    if (playerState.selectedIndices) {
        cubeDivs.forEach((div, idx) => {
            if (playerState.selectedIndices!.includes(idx)) {
                div.classList.add('selected');
            } else {
                div.classList.remove('selected');
            }
        });
    }
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
