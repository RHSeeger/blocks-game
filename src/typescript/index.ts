// The main TypeScript entry point for the web app

import "../css/styles.css";
import { renderBoard, getInitialCubes, setGameState, getGameState } from "./board";
import { isBoardFinished } from "./board";

// This is where the code that sets up the game lives... calls to initialize the game, load assets, etc.

/* window.addEventListener("DOMContentLoaded", () => {
    const boardContainer = document.getElementById("human-board");
    if (boardContainer) {
        createBoard(boardContainer);
    }
});
 */

// --- Persistent Game State Management ---
export interface GameState {
    cubes: { color: string | null }[];
    playerHealth: number;
    playerScore: number;
    boardNumber: number;
}

const LOCAL_STORAGE_KEY = "blocksGameState";

// Expose gameState globally for dev console
// @ts-ignore
window.gameState = null;

function saveGameState(state: GameState) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    // @ts-ignore
    window.gameState = state;
}

function loadGameState(): GameState | null {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    try {
        const state = JSON.parse(raw);

        // @ts-ignore
        window.gameState = state;
        return state;
    } catch {
        return null;
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const humanBoardContainer = document.getElementById("human-board");
    const computerBoardContainer = document.getElementById("computer-board");
    if (!humanBoardContainer || !computerBoardContainer) return;

    let state = loadGameState();
    if (!state) {
        // New game
        state = {
            cubes: getInitialCubes(),
            playerHealth: 100,
            playerScore: 0,
            boardNumber: 1,
        };
        saveGameState(state);
    }

    // --- Tab switching logic ---
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tab = btn.getAttribute('data-tab');
            tabContents.forEach(tc => {
                if (tc.id === `${tab}-tab`) {
                    tc.classList.add('active');
                } else {
                    tc.classList.remove('active');
                }
            });
        });
    });

    // --- Reset Game State logic ---
    const resetBtn = document.getElementById('reset-game-btn');
    const resetWarning = document.getElementById('reset-warning');
    const confirmBtn = document.getElementById('confirm-reset-btn');
    const cancelBtn = document.getElementById('cancel-reset-btn');
    if (resetBtn && resetWarning && confirmBtn && cancelBtn) {
        resetBtn.addEventListener('click', () => {
            resetWarning.style.display = 'block';
        });
        cancelBtn.addEventListener('click', () => {
            resetWarning.style.display = 'none';
        });
        confirmBtn.addEventListener('click', () => {
            // Reset state
            const newState: GameState = {
                cubes: getInitialCubes(),
                playerHealth: 100,
                playerScore: 0,
                boardNumber: 1,
            };
            saveGameState(newState);
            setGameState(newState, (updatedState: GameState) => {
                saveGameState(updatedState);
            });
            humanBoardContainer.classList.remove('inactive');
            renderBoard(humanBoardContainer, newState.cubes);
            // Reset computer board as well
            renderComputerBoard(computerBoardContainer);
            resetWarning.style.display = 'none';
            // Switch to Main tab after reset
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));
            document.querySelector('.tab-button[data-tab="main"]')?.classList.add('active');
            document.getElementById('main-tab')?.classList.add('active');
        });
    }

    // Set up board and state hooks
    setGameState(state, (updatedState: GameState) => {
        saveGameState(updatedState);
    });
    renderBoard(humanBoardContainer, state.cubes);
    renderComputerBoard(computerBoardContainer);

    // If the restored board is finished, apply inactive state and show next board button if needed
    if (isBoardFinished(state.cubes)) {
        humanBoardContainer.classList.add('inactive');
        // Try to show the next board button if health > 0
        // Import createNextBoardButton dynamically to avoid circular deps
        import('./board').then(mod => {
            if (state.playerHealth > 0 && typeof mod["createNextBoardButton"] === "function") {
                mod.createNextBoardButton(humanBoardContainer, state.cubes);
            }
        });
    }

    // Render computer board (non-interactive)
    function renderComputerBoard(boardEl: HTMLElement) {
        boardEl.innerHTML = "";
        const cubes = getInitialCubes();
        for (let i = 0; i < 100; i++) {
            const cubeDiv = document.createElement('div');
            cubeDiv.className = 'cube';
            cubeDiv.style.setProperty('--cube-color', cubes[i]?.color || '#fff');
            cubeDiv.style.cursor = 'default';
            cubeDiv.style.pointerEvents = 'none';
            boardEl.appendChild(cubeDiv);
        }
    }
});
