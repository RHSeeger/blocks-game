import { getConnectedIndices } from '../board';
// GameComponent.ts
// Handles main game DOM setup and event logic

import { BoardState, getInitialCubes, calculateGroupScore, isBoardFinished } from '../board';
import type { Cube } from '../cube';
import { updatePlayerComponent } from './PlayerComponent';
import type { GameState } from '../gameState';
import { updateStatsDisplay } from './StatsComponent';
import { updateAchievementsDisplay } from './AchievementsComponent';
import { updateUnlocksDisplay } from './UnlocksComponent';
import { saveGameState, loadGameStateFromStorage } from '../initialization';
import { resetGameStateAndRender } from '../resetGameState';

function updateBoardScoreDisplays(gameState: GameState) {
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
                // Only reset the board for the human player, keep all other state
                gameState.humanPlayer.board = new BoardState(getInitialCubes('player', gameState.unlockedUnlocks));
                gameState.humanPlayer.boardScore = 0;
                saveGameState(gameState);
                updatePlayerComponent(humanBoardContainer, gameState.humanPlayer.board.cubes, gameState.humanPlayer);
                updateBoardScoreDisplays(gameState);
            });
        }

        // Set up board and state hooks
        // All board and UI updates should use gameState only
        updatePlayerComponent(humanBoardContainer, gameState.humanPlayer.board.cubes, gameState.humanPlayer);
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

function getAllValidGroups(cubes: { color: string | null }[]): number[][] {
    const groups: number[][] = [];
    const visited = new Set<number>();
    for (let i = 0; i < cubes.length; i++) {
        if (cubes[i].color === null || visited.has(i)) continue;
        // cubes is always Cube[] here, so cast is not needed
        const group = getConnectedIndices(i, cubes as Cube[]);
        if (group.length > 1) {
            groups.push(group);
            group.forEach((idx: number) => visited.add(idx));
        }
    }
    return groups;
}

function computerTurn(computerBoardContainer: HTMLElement | null, gameState: GameState) {
    if (!computerBoardContainer) return;
    const comp = gameState.computerPlayer;
    const groups = getAllValidGroups(comp.board.cubes);
    if (isBoardFinished(comp.board.cubes) || groups.length === 0) {
        comp.selectedIndices = [];
        updateComputerStats(gameState);
        comp.board = new BoardState(getInitialCubes('computer', gameState.unlockedUnlocks));
        comp.boardNumber = (typeof comp.boardNumber === 'number' ? comp.boardNumber : 1) + 1;
        comp.boardScore = 0;
        renderComputerBoard(computerBoardContainer, gameState);
        return;
    }
    if (!comp.selectedIndices || comp.selectedIndices.length === 0) {
        if (groups.length > 0) {
            const group = groups[Math.floor(Math.random() * groups.length)];
            comp.selectedIndices = group;
        }
        renderComputerBoard(computerBoardContainer, gameState);
        return;
    }
    if (comp.selectedIndices.length > 0) {
        const groupScore = calculateGroupScore(comp.selectedIndices.length);
        comp.totalScore = (typeof comp.totalScore === 'number' ? comp.totalScore : 0) + groupScore;
        comp.boardScore = (typeof comp.boardScore === 'number' ? comp.boardScore : 0) + groupScore;
        if (typeof comp.maxBoardScore !== 'number' || comp.boardScore > comp.maxBoardScore) {
            comp.maxBoardScore = comp.boardScore;
        }
        comp.selectedIndices.forEach((idx: number) => {
            comp.board.cubes[idx].color = null;
        });
        comp.board.applyGravity();
        comp.selectedIndices = [];
        renderComputerBoard(computerBoardContainer, gameState);
        return;
    }
}
