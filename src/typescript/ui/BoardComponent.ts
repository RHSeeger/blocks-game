import { BoardState, getConnectedIndices, getConnectedIndicesBeforeSpecial, calculateGroupScore, isBoardFinished } from '../board';
import { saveGameState } from '../initialization';
import type { PlayerState } from '../playerState';
/**
 * BoardComponent.ts
 * Handles rendering and updating only the board grid display for a player.
 */
import type { Cube } from '../cube';

/**
 * Updates only the board grid display in the DOM for the given board element and cubes array.
 * Does not update any player info, score, or other UI elements.
 * @param board The board HTMLElement to update
 * @param cubesArr The array of cubes representing the board state
 */
export function updateBoard(board: HTMLElement, cubesArr: Cube[]): void {
    if (!board) return;
    board.innerHTML = '';
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
    gameState: any
) {
    const cubeDivs = Array.from(board.querySelectorAll('.cube')) as HTMLDivElement[];
    let selectedIndices: number[] = [];
    function updateScoreDisplay() {
        const scoreDisplay = document.getElementById('human-score');
        if (!scoreDisplay || !playerState) return;
        const baseScore = (typeof playerState.totalScore === 'number' ? playerState.totalScore : 0).toString();
        const nonSpecialCount = selectedIndices.filter((idx) => !cubesArr[idx].special).length;
        if (selectedIndices.length > 0 && nonSpecialCount > 0) {
            const groupScore = calculateGroupScore(nonSpecialCount);
            scoreDisplay.textContent = `${baseScore} (+${groupScore})`;
        } else {
            scoreDisplay.textContent = baseScore;
        }
    }
    function removeSelectedGroup(boardState: BoardState) {
        if (!playerState) return;
        const nonSpecialCount = selectedIndices.filter((idx) => !cubesArr[idx].special).length;
        const groupScore = calculateGroupScore(nonSpecialCount);
        playerState.totalScore += groupScore;
        playerState.boardScore += groupScore;
        if (playerState.boardScore > playerState.maxBoardScore) {
            playerState.maxBoardScore = playerState.boardScore;
        }
        const scoreDisplay = document.getElementById('human-score');
        if (scoreDisplay) {
            scoreDisplay.textContent = playerState.totalScore.toString();
        }
        cubeDivs.forEach((div, idx) => {
            if (div.classList.contains('selected')) {
                cubesArr[idx].color = null;
                if (cubesArr[idx].special) {
                    delete cubesArr[idx].special;
                }
            }
        });
        boardState.applyGravity();
        selectedIndices = [];
        gameState.humanPlayer.board.cubes = cubesArr;
        saveGameState(gameState);
        updateBoard(board, cubesArr);
        attachBoardInteractions(board, cubesArr, playerState, gameState);
        if (isBoardFinished(cubesArr)) {
            board.classList.add('inactive');
        }
    }
    cubeDivs.forEach((cubeDiv, i) => {
        cubeDiv.addEventListener('click', (event) => {
            event.stopPropagation();
            if (cubesArr[i].special) return;
            const getConnectedIndicesBeforeSpecialLocal = (startIdx: number) =>
                getConnectedIndicesBeforeSpecial(startIdx, cubesArr);
            const groupIndices = getConnectedIndices(i, cubesArr);
            const groupIndicesBeforeSpecial = getConnectedIndicesBeforeSpecialLocal(i);
            if (groupIndicesBeforeSpecial.length < 2) return;
            if (cubeDiv.classList.contains('selected')) {
                const boardState = new BoardState(cubesArr);
                removeSelectedGroup(boardState);
                return;
            }
            cubeDivs.forEach((div) => div.classList.remove('selected'));
            groupIndices.forEach((idx) => cubeDivs[idx].classList.add('selected'));
            selectedIndices = groupIndices;
            updateScoreDisplay();
        });
    });
    document.addEventListener('click', function handleDocClick(event) {
        if (cubeDivs.some((div) => div.classList.contains('selected'))) {
            const target = event.target as HTMLElement;
            if (!target.classList.contains('selected')) {
                cubeDivs.forEach((div) => div.classList.remove('selected'));
                selectedIndices = [];
                updateScoreDisplay();
            }
        }
    });
}
