// GameComponent.ts
// Handles main game DOM setup and event logic

import { setGameState, BoardState, getInitialCubes, calculateGroupScore, isBoardFinished, renderBoard } from "../board";
import type { PlayerState } from "../playerState";
import type { GameState } from "../gameState";
import { updateStatsDisplay } from "./StatsComponent";
import { updateAchievementsDisplay } from "./AchievementsComponent";
import { updateUnlocksDisplay } from "./UnlocksComponent";
import { saveGameState, loadGameState, savePlayerStats, loadGameStateFromStorage, saveAchievements, loadAchievements, saveUnlocks, loadUnlocks } from "../initialization";
import { ALL_ACHIEVEMENTS } from "../achievements-list";
import { ALL_UNLOCKS } from "../unlocks-list";
import type { Achievement } from "../achievement";

        function updateBoardScoreDisplays(human: PlayerState, computer?: PlayerState) {
            const humanBoardScoreElem = document.getElementById('human-board-score');
            const humanMaxBoardScoreElem = document.getElementById('human-max-board-score');
            if (humanBoardScoreElem) humanBoardScoreElem.textContent = human.boardScore?.toString() ?? '0';
            if (humanMaxBoardScoreElem) humanMaxBoardScoreElem.textContent = human.maxBoardScore?.toString() ?? '0';
            const computerBoardScoreElem = document.getElementById('computer-board-score');
            const computerMaxBoardScoreElem = document.getElementById('computer-max-board-score');
            if (computer && computerBoardScoreElem) computerBoardScoreElem.textContent = computer.boardScore?.toString() ?? '0';
            if (computer && computerMaxBoardScoreElem) computerMaxBoardScoreElem.textContent = computer.maxBoardScore?.toString() ?? '0';
        }
export function setupGameComponent(gameState: GameState) {
    window.addEventListener("DOMContentLoaded", () => {
        // Ensure window.unlockedUnlocks is set for getInitialCubes
        (window as any).unlockedUnlocks = gameState.unlockedUnlocks;
        loadGameStateFromStorage(gameState);
        const humanBoardContainer = document.getElementById("human-board");
        const computerBoardContainer = document.getElementById("computer-board");
        if (!humanBoardContainer) return;

        let state = loadGameState();
        if (!state) {
            // New game
            state = {
                board: new BoardState(getInitialCubes('player')),
                totalScore: 0,
                boardScore: 0,
                maxBoardScore: 0,
                boardNumber: 1,
            };
            saveGameState(state);
        }
        updateBoardScoreDisplays(state, gameState.computerPlayer);

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
                if (tab === 'stats') {
                    updateStatsDisplay(gameState);
                } else if (tab === 'achievements') {
                    updateAchievementsDisplay();
                } else if (tab === 'unlocks') {
                    updateUnlocksDisplay();
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
                // Reset state
                const newState: PlayerState = {
                    board: new BoardState(getInitialCubes('player')),
                    totalScore: 0,
                    boardScore: 0,
                    maxBoardScore: 0,
                    boardNumber: 1,
                };
                saveGameState(newState);
                // Reset player stats in memory and localStorage
                gameState.gameStats = { largestGroup: 0, groupSizeCounts: {} };
                savePlayerStats(gameState.gameStats);
                updateStatsDisplay(gameState);
                setGameState(newState, (updatedState: PlayerState) => {
                    saveGameState(updatedState);
                });
                humanBoardContainer.classList.remove('inactive');
                renderBoard(humanBoardContainer, newState.board.cubes);
                updateBoardScoreDisplays(newState, gameState.computerPlayer);
                // Reset computer board as well
                renderComputerBoard(computerBoardContainer, gameState);
                resetWarning.style.display = 'none';
                // Switch to Main tab after reset
                tabButtons.forEach(b => b.classList.remove('active'));
                tabContents.forEach(tc => tc.classList.remove('active'));
                document.querySelector('.tab-button[data-tab="main"]')?.classList.add('active');
                document.getElementById('main-tab')?.classList.add('active');
            });
        }

        // --- Reset Human Player Board Only ---
        const resetHumanBoardBtn = document.getElementById('reset-human-board-btn');
        if (resetHumanBoardBtn) {
            resetHumanBoardBtn.addEventListener('click', () => {
                // Only reset the board for the human player, keep all other state
                let currentState = loadGameState();
                if (!currentState) return;
                currentState.board = new BoardState(getInitialCubes('player'));
                currentState.boardScore = 0;
                saveGameState(currentState);
                renderBoard(humanBoardContainer, currentState.board.cubes);
                updateBoardScoreDisplays(currentState, gameState.computerPlayer);
            });
        }

        // Set up board and state hooks
        setGameState(state, (updatedState: PlayerState, removedGroup?: number[]) => {
            saveGameState(updatedState);
            updateBoardScoreDisplays(updatedState, gameState.computerPlayer);
            // Stats update if player removed a group
            if (removedGroup && removedGroup.length > 1) {
                const groupSize = removedGroup.length;
                if (groupSize > gameState.gameStats.largestGroup) {
                    gameState.gameStats.largestGroup = groupSize;
                }
                gameState.gameStats.groupSizeCounts[groupSize] = (gameState.gameStats.groupSizeCounts[groupSize] || 0) + 1;
                savePlayerStats(gameState.gameStats);
                updateStatsDisplay(gameState);
            }

            // Check for new achievements
            let achievedAchievements: Achievement[] = loadAchievements();
            let newAchievements: Achievement[] = [];
            for (const ach of ALL_ACHIEVEMENTS) {
                if (!achievedAchievements.some(a => a.internalName === ach.internalName)) {
                    // TODO: Add actual logic for earning achievements here
                    // For now, as a placeholder, unlock 'first_clear' on first group removal
                    if (ach.internalName === 'first_clear') {
                        achievedAchievements.push(ach);
                        saveAchievements(achievedAchievements);
                        updateAchievementsDisplay();
                        // onAchievementAccomplished(ach); // TODO: Move this logic to AchievementsComponent
                        newAchievements.push(ach);
                    }
                }
            }
        });
        renderBoard(humanBoardContainer, state.board.cubes);
        updateBoardScoreDisplays(state, gameState.computerPlayer);
        updateStatsDisplay(gameState);
        updateAchievementsDisplay();
        updateUnlocksDisplay(); // Initialize unlocks display

        // --- Computer Player State ---
        if (!(gameState.computerPlayer as any).selectedIndices) {
            (gameState.computerPlayer as any).selectedIndices = [];
        }
        renderComputerBoard(computerBoardContainer, gameState);
        setInterval(() => computerTurn(computerBoardContainer, gameState), 1000);
    });
}

export function renderComputerBoard(boardEl: HTMLElement | null, gameState: GameState) {
    if (!boardEl) return;
    boardEl.innerHTML = "";
    const cubeDivs: HTMLDivElement[] = [];
    const comp = gameState.computerPlayer as any;
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
    cubeDivs.forEach(div => div.classList.remove('selected'));
    comp.selectedIndices.forEach((idx: number) => {
        cubeDivs[idx].classList.add('selected');
    });
    updateComputerStats(gameState);
}

function updateComputerStats(gameState: GameState) {
    const scoreDisplay = document.getElementById('computer-score');
    const boardNumDisplay = document.getElementById('computer-board-number');
    const boardScoreDisplay = document.getElementById('computer-board-score');
    const maxBoardScoreDisplay = document.getElementById('computer-max-board-score');
    const comp = gameState.computerPlayer as any;
    if (scoreDisplay) scoreDisplay.textContent = (typeof comp.totalScore === 'number' ? comp.totalScore : 0).toString();
    if (boardScoreDisplay) boardScoreDisplay.textContent = (typeof comp.boardScore === 'number' ? comp.boardScore : 0).toString();
    if (maxBoardScoreDisplay) maxBoardScoreDisplay.textContent = (typeof comp.maxBoardScore === 'number' ? comp.maxBoardScore : 0).toString();
    if (boardNumDisplay) boardNumDisplay.textContent = (typeof comp.boardNumber === 'number' ? comp.boardNumber : 1).toString();
}

function getAllValidGroups(cubes: { color: string | null }[]): number[][] {
    const groups: number[][] = [];
    const visited = new Set<number>();
    const boardState = new BoardState(cubes as any);
    for (let i = 0; i < cubes.length; i++) {
        if (cubes[i].color === null || visited.has(i)) continue;
        const group = boardState.getConnectedIndices(i);
        if (group.length > 1) {
            groups.push(group);
            group.forEach((idx: number) => visited.add(idx));
        }
    }
    return groups;
}

function computerTurn(computerBoardContainer: HTMLElement | null, gameState: GameState) {
    if (!computerBoardContainer) return;
    const comp = gameState.computerPlayer as any;
    const groups = getAllValidGroups(comp.board.cubes);
    if (isBoardFinished(comp.board.cubes) || groups.length === 0) {
        const remaining = comp.board.cubes.filter((c: any) => c.color !== null).length;
        comp.selectedIndices = [];
        updateComputerStats(gameState);
        comp.board = new BoardState(getInitialCubes('computer'));
        comp.boardNumber = (typeof comp.boardNumber === 'number' ? comp.boardNumber : 1) + 1;
        comp.boardScore = 0;
        renderComputerBoard(computerBoardContainer, gameState);
        return;
    }
    if (comp.selectedIndices.length === 0) {
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
