// import { getConnectedIndices } from '../gamelogic/BoardState'; // UI should not import logic
// GameComponent.ts
// Handles main game DOM setup and event logic

import type { BoardStateView } from '../bridge/BoardStateView';
import type { CubeView } from '../bridge/CubeView';
import { updatePlayerComponent } from './PlayerComponent';
import type { GameState } from '../GameState';
import { updateStatsDisplay } from './StatsComponent';
import { updateAchievementsDisplay } from './AchievementsComponent';
import { updateUnlocksDisplay } from './UnlocksComponent';
import { saveGameState, loadGameStateFromStorage } from '../initialization';
import { resetGameStateAndRender } from '../resetGameState';

export function updateBoardScoreDisplays(gameState: GameState) {
    const humanBoardScoreElem = document.getElementById('human-board-score');
    const humanMaxBoardScoreElem = document.getElementById('human-max-board-score');
    if (humanBoardScoreElem) humanBoardScoreElem.textContent = gameState.humanPlayer.boardScore?.toString() ?? '0';
    if (humanMaxBoardScoreElem)
        humanMaxBoardScoreElem.textContent = gameState.humanPlayer.maxBoardScore?.toString() ?? '0';
    const computerBoardScoreElem = document.getElementById('computer-board-score');
    const computerMaxBoardScoreElem = document.getElementById('computer-max-board-score');
    if (computerBoardScoreElem)
        computerBoardScoreElem.textContent = gameState.computerPlayer.boardScore?.toString() ?? '0';
    if (computerMaxBoardScoreElem)
        computerMaxBoardScoreElem.textContent = gameState.computerPlayer.maxBoardScore?.toString() ?? '0';
}
export function setupGameComponent(gameState: GameState) {
    window.addEventListener('DOMContentLoaded', () => {
        // ...existing code...
        const loadedState = loadGameStateFromStorage();
        Object.assign(gameState, loadedState);
        const humanBoardContainer = document.getElementById('human-board');
        const computerBoardContainer = document.getElementById('computer-board');
        if (!humanBoardContainer) return;
        updateBoardScoreDisplays(gameState);

        // --- Tab switching logic ---
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        tabButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                tabButtons.forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');
                const tab = btn.getAttribute('data-tab');
                tabContents.forEach((tc) => {
                    if (tc.id === `${tab}-tab`) {
                        tc.classList.add('active');
                    } else {
                        tc.classList.remove('active');
                    }
                });
                if (tab === 'stats') {
                    updateStatsDisplay(gameState);
                } else if (tab === 'achievements') {
                    updateAchievementsDisplay(gameState);
                } else if (tab === 'unlocks') {
                    updateUnlocksDisplay(gameState);
                }
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
                if (humanBoardContainer && computerBoardContainer) {
                    resetGameStateAndRender(gameState, humanBoardContainer, computerBoardContainer);
                }
                resetWarning.style.display = 'none';
                // Switch to Main tab after reset
                tabButtons.forEach((b) => b.classList.remove('active'));
                tabContents.forEach((tc) => tc.classList.remove('active'));
                document.querySelector('.tab-button[data-tab="main"]')?.classList.add('active');
                document.getElementById('main-tab')?.classList.add('active');
            });
        }

        // --- Reset Human Player Board Only ---
        const resetHumanBoardBtn = document.getElementById('reset-human-board-btn');
        if (resetHumanBoardBtn) {
            resetHumanBoardBtn.addEventListener('click', () => {
                // UI should not directly reset the board. Delegate to bridge/game logic.
                // Example: bridge.resetHumanBoard(gameState) or emit event for logic to handle.
                // Here, just emit a custom event as a placeholder:
                const event = new CustomEvent('resetHumanBoardRequested');
                window.dispatchEvent(event);
            });
        }

        // Set up board and state hooks
        // All board and UI updates should use gameState only
        // Ensure we pass CubeView[] (objects with getColor/getSpecial) to updatePlayerComponent
        const cubesArr = gameState.humanPlayer.board.cubes.map(cube => {
            if (typeof cube.getColor === 'function' && typeof cube.getSpecial === 'function') {
                return cube;
            }
            return {
                getColor: () => cube.color ?? null,
                getSpecial: () => cube.special
            };
        });
        updatePlayerComponent(humanBoardContainer, cubesArr, gameState.humanPlayer as any);
        updateBoardScoreDisplays(gameState);
        updateStatsDisplay(gameState);
        updateAchievementsDisplay(gameState);
        updateUnlocksDisplay(gameState); // Initialize unlocks display

        // --- Computer Player State ---
        if (!gameState.computerPlayer.selectedIndices) {
            gameState.computerPlayer.selectedIndices = [];
        }
        renderComputerBoard(computerBoardContainer, gameState);
        setInterval(() => computerTurn(computerBoardContainer, gameState), 1000);
    });
}

export function renderComputerBoard(boardEl: HTMLElement | null, gameState: GameState) {
    if (!boardEl) return;
    boardEl.innerHTML = '';
    const cubeDivs: HTMLDivElement[] = [];
    const comp = gameState.computerPlayer;
    for (let i = 0; i < 100; i++) {
        const cubeDiv = document.createElement('div');
        cubeDiv.className = 'cube';
        cubeDiv.style.setProperty('--cube-color', comp.board.cubes[i]?.color || '#fff');
        cubeDiv.style.cursor = 'default';
        cubeDiv.style.pointerEvents = 'none';
        if (comp.board.cubes[i].color === null) {
            cubeDiv.style.opacity = '0.2';
        }
        cubeDivs.push(cubeDiv);
        boardEl.appendChild(cubeDiv);
    }
    // Highlight selected group
    cubeDivs.forEach((div) => div.classList.remove('selected'));
    (comp.selectedIndices || []).forEach((idx: number) => {
        cubeDivs[idx].classList.add('selected');
    });
    updateComputerStats(gameState);
}

function updateComputerStats(gameState: GameState) {
    const scoreDisplay = document.getElementById('computer-score');
    const boardNumDisplay = document.getElementById('computer-board-number');
    const boardScoreDisplay = document.getElementById('computer-board-score');
    const maxBoardScoreDisplay = document.getElementById('computer-max-board-score');
    const comp = gameState.computerPlayer;
    if (scoreDisplay) scoreDisplay.textContent = (typeof comp.totalScore === 'number' ? comp.totalScore : 0).toString();
    if (boardScoreDisplay)
        boardScoreDisplay.textContent = (typeof comp.boardScore === 'number' ? comp.boardScore : 0).toString();
    if (maxBoardScoreDisplay)
        maxBoardScoreDisplay.textContent = (typeof comp.maxBoardScore === 'number' ? comp.maxBoardScore : 0).toString();
    if (boardNumDisplay)
        boardNumDisplay.textContent = (typeof comp.boardNumber === 'number' ? comp.boardNumber : 1).toString();
}

// getAllValidGroups and getConnectedIndices should be handled in logic/bridge, not UI.

function computerTurn(computerBoardContainer: HTMLElement | null, gameState: GameState) {
    // UI should not mutate board or player state, or call game logic functions directly.
    // Delegate all board/score changes and group selection to bridge/game logic.
    // Only read state and render.
    // Function intentionally left empty to enforce separation.
}
