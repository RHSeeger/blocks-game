// The main TypeScript entry point for the web app

import "../css/styles.css";
import { renderBoard, getInitialCubes, setGameState, getGameState, isBoardFinished, getConnectedIndices, calculateGroupScore, applyGravity } from "./board";
// --- Player Stats Tracking ---
const PLAYER_STATS_KEY = "blocksPlayerStats";
interface PlayerStats {
    largestGroup: number;
    groupSizeCounts: Record<number, number>;
}

function loadPlayerStats(): PlayerStats {
    const raw = localStorage.getItem(PLAYER_STATS_KEY);
    if (!raw) return { largestGroup: 0, groupSizeCounts: {} };
    try {
        const stats = JSON.parse(raw);
        if (typeof stats.largestGroup === 'number' && typeof stats.groupSizeCounts === 'object') {
            return stats;
        }
        return { largestGroup: 0, groupSizeCounts: {} };
    } catch {
        return { largestGroup: 0, groupSizeCounts: {} };
    }
}

function savePlayerStats(stats: PlayerStats) {
    localStorage.setItem(PLAYER_STATS_KEY, JSON.stringify(stats));
}

let playerStats: PlayerStats = loadPlayerStats();

function updateStatsDisplay() {
    const largestGroupElem = document.getElementById('largest-group-value');
    const groupSizeCountsElem = document.getElementById('group-size-counts');
    if (largestGroupElem) {
        largestGroupElem.textContent = playerStats.largestGroup.toString();
    }
    if (groupSizeCountsElem) {
        let html = '<b>Block groups removed (by size):</b><ul style="margin-top:0">';
        const sizes = Object.keys(playerStats.groupSizeCounts).map(Number).sort((a,b) => b-a);
        for (const size of sizes) {
            html += `<li>Size ${size}: ${playerStats.groupSizeCounts[size]}</li>`;
        }
        html += '</ul>';
        groupSizeCountsElem.innerHTML = html;
    }
    savePlayerStats(playerStats);
}

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
    if (!humanBoardContainer) return;

    let state = loadGameState();
    if (!state) {
        // New game
        state = {
            cubes: getInitialCubes('player'),
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
            const newState: GameState = {
                cubes: getInitialCubes('player'),
                playerHealth: 100,
                playerScore: 0,
                boardNumber: 1,
            };
            saveGameState(newState);
            // Reset player stats in memory and localStorage
            playerStats = { largestGroup: 0, groupSizeCounts: {} };
            savePlayerStats(playerStats);
            updateStatsDisplay();
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
    setGameState(state, (updatedState: GameState, removedGroup?: number[]) => {
        saveGameState(updatedState);
        // Stats update if player removed a group
        if (removedGroup && removedGroup.length > 1) {
            const groupSize = removedGroup.length;
            if (groupSize > playerStats.largestGroup) {
                playerStats.largestGroup = groupSize;
            }
            playerStats.groupSizeCounts[groupSize] = (playerStats.groupSizeCounts[groupSize] || 0) + 1;
            savePlayerStats(playerStats);
            updateStatsDisplay();
        }
    });
    renderBoard(humanBoardContainer, state.cubes);
    updateStatsDisplay();

    // --- Computer Player State ---
    let computerState = {
        cubes: getInitialCubes('computer'),
        playerHealth: 100,
        playerScore: 0,
        boardNumber: 1,
        selectedIndices: [] as number[],
    };

    function updateComputerStats() {
        const scoreDisplay = document.getElementById('computer-score');
        const healthDisplay = document.getElementById('computer-health');
        const boardNumDisplay = document.getElementById('computer-board-number');
        if (scoreDisplay) scoreDisplay.textContent = computerState.playerScore.toString();
        if (healthDisplay) healthDisplay.textContent = computerState.playerHealth.toString();
        if (boardNumDisplay) boardNumDisplay.textContent = computerState.boardNumber.toString();
    }

    function renderComputerBoard(boardEl: HTMLElement | null) {
        if (!boardEl) return;
        boardEl.innerHTML = "";
        const cubeDivs: HTMLDivElement[] = [];
        for (let i = 0; i < 100; i++) {
            const cubeDiv = document.createElement('div');
            cubeDiv.className = 'cube';
            cubeDiv.style.setProperty('--cube-color', computerState.cubes[i]?.color || '#fff');
            cubeDiv.style.cursor = 'default';
            cubeDiv.style.pointerEvents = 'none';
            if (computerState.cubes[i].color === null) {
                cubeDiv.style.opacity = '0.2';
            }
            cubeDivs.push(cubeDiv);
            boardEl.appendChild(cubeDiv);
        }
        // Highlight selected group
        cubeDivs.forEach(div => div.classList.remove('selected'));
        computerState.selectedIndices.forEach(idx => {
            cubeDivs[idx].classList.add('selected');
        });
        updateComputerStats();
    }

    // Computer player logic
    function getAllValidGroups(cubes: { color: string | null }[]): number[][] {
        const groups: number[][] = [];
        const visited = new Set<number>();
        for (let i = 0; i < cubes.length; i++) {
            if (cubes[i].color === null || visited.has(i)) continue;
            const group = getConnectedIndices(i, cubes);
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
        const groups = getAllValidGroups(computerState.cubes);
        if (isBoardFinished(computerState.cubes) || groups.length === 0) {
            // End of board actions: reset board immediately, do NOT apply inactive state/overlay
            const remaining = computerState.cubes.filter(c => c.color !== null).length;
            computerState.playerHealth -= remaining;
            computerState.selectedIndices = [];
            updateComputerStats();
            if (computerState.playerHealth > 0) {
                // New board
                computerState.cubes = getInitialCubes('computer');
                computerState.boardNumber++;
            }
            renderComputerBoard(computerBoardContainer);
            return;
        }

        // If no group selected, pick a random valid group
        if (computerState.selectedIndices.length === 0) {
            if (groups.length > 0) {
                const group = groups[Math.floor(Math.random() * groups.length)];
                computerState.selectedIndices = group;
            }
            renderComputerBoard(computerBoardContainer);
            return;
        }

        // If group selected, remove it
        if (computerState.selectedIndices.length > 0) {
            // Calculate score
            const groupScore = calculateGroupScore(computerState.selectedIndices.length);
            computerState.playerScore += groupScore;
            // Remove selected blocks
            computerState.selectedIndices.forEach((idx: number) => {
                computerState.cubes[idx].color = null;
            });
            // Apply gravity
            applyGravity(computerState.cubes);
            computerState.selectedIndices = [];
            renderComputerBoard(computerBoardContainer);
            return;
        }
    }

    // Board helpers are imported directly; no need to assign to window

    // Start computer player interval
    renderComputerBoard(computerBoardContainer);
    setInterval(computerTurn, 1000);
});
