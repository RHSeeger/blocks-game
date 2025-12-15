import "../css/styles.css";
import { renderBoard, getInitialCubes, setGameState, getGameState, isBoardFinished, getConnectedIndices, calculateGroupScore, applyGravity, BoardState } from "./board";
import type { GameStats } from "./gameStats";
import type { Achievement } from "./achievement";
import { ALL_ACHIEVEMENTS } from "./achievements-list";
import type { Unlocks } from "./unlocks";
import { ALL_UNLOCKS } from "./unlocks-list";
import type { GameState } from "./gameState";
import { createInitialGameState } from "./initialization";

// --- GameState Initialization ---
let gameState: GameState = createInitialGameState();

import {
    loadGameStateFromStorage,
    savePlayerStats,
    saveGameState,
    loadGameState,
    saveAchievements,
    loadAchievements,
    saveUnlocks,
    loadUnlocks
} from "./initialization";
// The main TypeScript entry point for the web app

// --- Game Stats Tracking ---
const PLAYER_STATS_KEY = "blocksPlayerStats";


export function updateStatsDisplay() {
    const largestGroupElem = document.getElementById('largest-group-value');
    const groupSizeCountsElem = document.getElementById('group-size-counts');
    if (largestGroupElem) {
        largestGroupElem.textContent = gameState.gameStats.largestGroup.toString();
    }
    if (groupSizeCountsElem) {
        let html = '<b>Block groups removed (by size):</b><ul style="margin-top:0">';
        const sizes = Object.keys(gameState.gameStats.groupSizeCounts).map(Number).sort((a,b) => b-a);
        for (const size of sizes) {
            html += `<li>Size ${size}: ${gameState.gameStats.groupSizeCounts[size]}</li>`;
        }
        html += '</ul>';
        groupSizeCountsElem.innerHTML = html;
    }
    savePlayerStats(gameState.gameStats);
}
// Expose for board.ts and global usage
(window as any).updateStatsDisplay = updateStatsDisplay;

// This is where the code that sets up the game lives... calls to initialize the game, load assets, etc.

/* window.addEventListener("DOMContentLoaded", () => {
    const boardContainer = document.getElementById("human-board");
    if (boardContainer) {
        createBoard(boardContainer);
    }
});
 */

// --- Persistent Game State Management ---

import type { PlayerState } from "./playerState";

const LOCAL_STORAGE_KEY = "blocksGameState";

// Expose gameState globally for dev console
// @ts-ignore
window.gameState = null;



window.addEventListener("DOMContentLoaded", () => {
    loadGameStateFromStorage(gameState);
    const humanBoardContainer = document.getElementById("human-board");
    const computerBoardContainer = document.getElementById("computer-board");
    if (!humanBoardContainer) return;

    let state = loadGameState();
    if (!state) {
        // New game
        state = {
            board: new BoardState(getInitialCubes('player')),
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
            if (tab === 'stats') {
                updateStatsDisplay();
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
                playerHealth: 100,
                playerScore: 0,
                boardNumber: 1,
            };
            saveGameState(newState);
            // Reset player stats in memory and localStorage
            gameState.gameStats = { largestGroup: 0, groupSizeCounts: {} };
            savePlayerStats(gameState.gameStats);
            updateStatsDisplay();
            setGameState(newState, (updatedState: PlayerState) => {
                saveGameState(updatedState);
            });
            humanBoardContainer.classList.remove('inactive');
            renderBoard(humanBoardContainer, newState.board.cubes);
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

    // --- Reset Human Player Board Only ---
    const resetHumanBoardBtn = document.getElementById('reset-human-board-btn');
    if (resetHumanBoardBtn) {
        resetHumanBoardBtn.addEventListener('click', () => {
            // Only reset the board for the human player, keep all other state
            let currentState = loadGameState();
            if (!currentState) return;
            currentState.board = new BoardState(getInitialCubes('player'));
            saveGameState(currentState);
            renderBoard(humanBoardContainer, currentState.board.cubes);
        });
    }

    // Set up board and state hooks
        setGameState(state, (updatedState: PlayerState, removedGroup?: number[]) => {
            saveGameState(updatedState);
            // Stats update if player removed a group
            if (removedGroup && removedGroup.length > 1) {
                const groupSize = removedGroup.length;
                if (groupSize > gameState.gameStats.largestGroup) {
                    gameState.gameStats.largestGroup = groupSize;
                }
                gameState.gameStats.groupSizeCounts[groupSize] = (gameState.gameStats.groupSizeCounts[groupSize] || 0) + 1;
                savePlayerStats(gameState.gameStats);
                updateStatsDisplay();
            }

            // Check for new achievements
            let newAchievements: Achievement[] = [];
            for (const ach of ALL_ACHIEVEMENTS) {
                if (!achievedAchievements.some(a => a.internalName === ach.internalName)) {
                    // TODO: Add actual logic for earning achievements here
                    // For now, as a placeholder, unlock 'first_clear' on first group removal
                    if (ach.internalName === 'first_clear') {
                        achievedAchievements.push(ach);
                        saveAchievements(achievedAchievements);
                        updateAchievementsDisplay();
                        onAchievementAccomplished(ach);
                        newAchievements.push(ach);
                    }
                }
            }
        });
    renderBoard(humanBoardContainer, state.board.cubes);
        renderBoard(humanBoardContainer, state.board.cubes);
    updateStatsDisplay();
    updateAchievementsDisplay();
    updateUnlocksDisplay(); // Initialize unlocks display

    // --- Computer Player State ---
    // Add selectedIndices to computerPlayer if not present
    if (!(gameState.computerPlayer as any).selectedIndices) {
        (gameState.computerPlayer as any).selectedIndices = [];
    }

    function updateComputerStats() {
        const scoreDisplay = document.getElementById('computer-score');
        const healthDisplay = document.getElementById('computer-health');
        const boardNumDisplay = document.getElementById('computer-board-number');
        const comp = gameState.computerPlayer as any;
        if (scoreDisplay) scoreDisplay.textContent = comp.playerScore.toString();
        if (healthDisplay) healthDisplay.textContent = comp.playerHealth.toString();
        if (boardNumDisplay) boardNumDisplay.textContent = comp.boardNumber.toString();
    }

    function renderComputerBoard(boardEl: HTMLElement | null) {
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
        updateComputerStats();
    }

    // Computer player logic
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

    function computerTurn() {
        if (!computerBoardContainer) return;
        // If board is finished or no valid moves
        const comp = gameState.computerPlayer as any;
        const groups = getAllValidGroups(comp.board.cubes);
        if (isBoardFinished(comp.board.cubes) || groups.length === 0) {
            // End of board actions: reset board immediately, do NOT apply inactive state/overlay
            const remaining = comp.board.cubes.filter((c: any) => c.color !== null).length;
            comp.playerHealth -= remaining;
            comp.selectedIndices = [];
            updateComputerStats();
            if (comp.playerHealth > 0) {
                // New board
                comp.board = new BoardState(getInitialCubes('computer'));
                comp.boardNumber++;
            }
            renderComputerBoard(computerBoardContainer);
            return;
        }

        // If no group selected, pick a random valid group
        if (comp.selectedIndices.length === 0) {
            if (groups.length > 0) {
                const group = groups[Math.floor(Math.random() * groups.length)];
                comp.selectedIndices = group;
            }
            renderComputerBoard(computerBoardContainer);
            return;
        }

        // If group selected, remove it
        if (comp.selectedIndices.length > 0) {
            // Calculate score
            const groupScore = calculateGroupScore(comp.selectedIndices.length);
            comp.playerScore += groupScore;
            // Remove selected blocks
            comp.selectedIndices.forEach((idx: number) => {
                comp.board.cubes[idx].color = null;
            });
            // Apply gravity
            comp.board.applyGravity();
            comp.selectedIndices = [];
            renderComputerBoard(computerBoardContainer);
            return;
        }
    }

    // Board helpers are imported directly; no need to assign to window

    // Start computer player interval
    renderComputerBoard(computerBoardContainer);
    setInterval(computerTurn, 1000);
});

// --- Achievements Tracking ---

const ACHIEVEMENTS_KEY = "blocksAchievements";



let achievedAchievements: Achievement[] = loadAchievements();

// Helper: unlock an unlock by internalName if not already unlocked
function unlockByInternalName(internalName: string) {
    if (!unlockedUnlocks.some(u => u.internalName === internalName)) {
        const unlock = ALL_UNLOCKS.find(u => u.internalName === internalName);
        if (unlock) {
            unlockedUnlocks.push(unlock);
            saveUnlocks(unlockedUnlocks);
            (window as any).unlockedUnlocks = unlockedUnlocks;
            updateUnlocksDisplay();
        }
    }
}

export function updateAchievementsDisplay() {
    const listElem = document.getElementById("achievements-list");
    if (!listElem) return;
    let html = '<ul style="margin-top:0">';
    for (const ach of ALL_ACHIEVEMENTS) {
        const unlocked = achievedAchievements.some(a => a.internalName === ach.internalName);
        html += `<li style="margin-bottom:8px;${unlocked ? '' : 'opacity:0.5;'}">
            <b>${ach.displayName}</b><br>
            <span>${ach.description}</span><br>
            <span style="font-size:0.9em;color:${unlocked ? 'green' : 'gray'};">${unlocked ? 'Unlocked' : 'Locked'}</span>
        </li>`;
    }
    html += '</ul>';
    listElem.innerHTML = html;
}

// When an achievement is accomplished, unlock its unlocks (if any)
function onAchievementAccomplished(achievement: Achievement) {
    if (achievement.unlocks) {
        unlockByInternalName(achievement.unlocks);
    }
}

(window as any).updateAchievementsDisplay = updateAchievementsDisplay;

// --- Unlocks Tracking ---
const UNLOCKS_KEY = "blocksUnlocks";



let unlockedUnlocks: Unlocks[] = loadUnlocks();
(window as any).unlockedUnlocks = unlockedUnlocks;

export function updateUnlocksDisplay() {
    const listElem = document.getElementById("unlocks-list");
    if (!listElem) return;
    let html = '<ul style="margin-top:0">';
    for (const unlock of ALL_UNLOCKS) {
        const unlocked = unlockedUnlocks.some(u => u.internalName === unlock.internalName);
        html += `<li style="margin-bottom:8px;${unlocked ? '' : 'opacity:0.5;'}">
            <b>${unlock.displayName}</b><br>
            <span>${unlock.description}</span><br>
            <span style="font-size:0.9em;color:${unlocked ? 'green' : 'gray'};">${unlocked ? 'Unlocked' : 'Locked'}</span>
        </li>`;
    }
    html += '</ul>';
    listElem.innerHTML = html;
}

(window as any).updateUnlocksDisplay = updateUnlocksDisplay;
