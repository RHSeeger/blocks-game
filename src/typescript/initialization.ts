import { BoardState, getInitialCubes } from './board';
import type { GameState } from './gameState';
import { ALL_ACHIEVEMENTS } from './achievements-list';
import { ALL_UNLOCKS } from './unlocks-list';
import type { GameStats } from './gameStats';
import type { Achievement } from './achievement';
import type { PlayerState } from './playerState';
import type { Unlocks } from './unlocks';

const PLAYER_STATS_KEY = 'blocksPlayerStats';
const LOCAL_STORAGE_KEY = 'blocksGameState';
const ACHIEVEMENTS_KEY = 'blocksAchievements';
const UNLOCKS_KEY = 'blocksUnlocks';

export function loadGameStateFromStorage(): GameState {
    const playerRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const loaded: Partial<GameState> = {};
    if (playerRaw) {
        try {
            const state = JSON.parse(playerRaw);
            // Backward compatibility for old saves
            if (state && state.humanPlayer && state.computerPlayer) {
                loaded.humanPlayer = {
                    ...state.humanPlayer,
                    board: new BoardState(state.humanPlayer.board.cubes),
                };
                loaded.computerPlayer = {
                    ...state.computerPlayer,
                    board: new BoardState(state.computerPlayer.board.cubes),
                };
            } else if (state && state.board && Array.isArray(state.board.cubes)) {
                loaded.humanPlayer = {
                    board: new BoardState(state.board.cubes),
                    totalScore: state.totalScore ?? state.playerScore ?? 0,
                    boardScore: state.boardScore ?? 0,
                    maxBoardScore: state.maxBoardScore ?? 0,
                    boardNumber: state.boardNumber,
                };
                loaded.computerPlayer = {
                    board: new BoardState(getInitialCubes('computer', [])),
                    totalScore: 0,
                    boardScore: 0,
                    maxBoardScore: 0,
                    boardNumber: 1,
                };
            } else if (state && state.cubes && Array.isArray(state.cubes)) {
                loaded.humanPlayer = {
                    board: new BoardState(state.cubes),
                    totalScore: state.totalScore ?? state.playerScore ?? 0,
                    boardScore: state.boardScore ?? 0,
                    maxBoardScore: state.maxBoardScore ?? 0,
                    boardNumber: state.boardNumber,
                };
                loaded.computerPlayer = {
                    board: new BoardState(getInitialCubes('computer', [])),
                    totalScore: 0,
                    boardScore: 0,
                    maxBoardScore: 0,
                    boardNumber: 1,
                };
            }
        } catch {}
    }
    if (!loaded.humanPlayer) {
        loaded.humanPlayer = {
            board: new BoardState(getInitialCubes('player', [])),
            totalScore: 0,
            boardScore: 0,
            maxBoardScore: 0,
            boardNumber: 1,
        };
    }
    if (!loaded.computerPlayer) {
        loaded.computerPlayer = {
            board: new BoardState(getInitialCubes('computer', [])),
            totalScore: 0,
            boardScore: 0,
            maxBoardScore: 0,
            boardNumber: 1,
        };
    }
    const statsRaw = localStorage.getItem(PLAYER_STATS_KEY);
    if (statsRaw) {
        try {
            const stats = JSON.parse(statsRaw);
            if (typeof stats.largestGroup === 'number' && typeof stats.groupSizeCounts === 'object') {
                loaded.gameStats = stats;
            }
        } catch {}
    }
    if (!loaded.gameStats) {
        loaded.gameStats = { largestGroup: 0, groupSizeCounts: {} };
    }
    const achRaw = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (achRaw) {
        try {
            const names: string[] = JSON.parse(achRaw);
            loaded.accomplishedAchievements = ALL_ACHIEVEMENTS.filter((a) => names.includes(a.internalName));
        } catch {}
    }
    if (!loaded.accomplishedAchievements) {
        loaded.accomplishedAchievements = [];
    }
    const unlocksRaw = localStorage.getItem(UNLOCKS_KEY);
    if (unlocksRaw) {
        try {
            const names: string[] = JSON.parse(unlocksRaw);
            loaded.unlockedUnlocks = ALL_UNLOCKS.filter((u) => names.includes(u.internalName));
        } catch {}
    }
    if (!loaded.unlockedUnlocks) {
        loaded.unlockedUnlocks = [];
    }
    return loaded as GameState;
}

export function savePlayerStats(stats: GameStats) {
    localStorage.setItem(PLAYER_STATS_KEY, JSON.stringify(stats));
}

export function saveGameState(gameState: GameState) {
    // Only save serializable data (avoid methods, class instances)
    const replacer = (key: string, value: any) => {
        if (key === 'board' && value && value.cubes) {
            return { cubes: value.cubes };
        }
        return value;
    };
    const toSave = {
        ...gameState,
        humanPlayer: {
            ...gameState.humanPlayer,
            board: { cubes: gameState.humanPlayer.board.cubes },
        },
        computerPlayer: {
            ...gameState.computerPlayer,
            board: { cubes: gameState.computerPlayer.board.cubes },
        },
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(toSave, replacer));
    // @ts-ignore
    window.gameState = gameState;
}

export function loadGameState(): PlayerState | null {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    try {
        const state = JSON.parse(raw);
        if (state && state.board && Array.isArray(state.board.cubes)) {
            state.board = new BoardState(state.board.cubes);
        } else if (state && state.cubes && Array.isArray(state.cubes)) {
            state.board = new BoardState(state.cubes);
            delete state.cubes;
        } else if (!state.board) {
            state.board = new BoardState([]);
        }
        // @ts-ignore
        window.gameState = state;
        return state;
    } catch {
        return null;
    }
}

export function saveAchievements(achieved: Achievement[]) {
    const internalNames = achieved.map((a) => a.internalName);
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(internalNames));
}

export function loadAchievements(): Achievement[] {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (!raw) return [];
    try {
        const names: string[] = JSON.parse(raw);
        return ALL_ACHIEVEMENTS.filter((a) => names.includes(a.internalName));
    } catch {
        return [];
    }
}

export function saveUnlocks(unlocked: Unlocks[]) {
    const internalNames = unlocked.map((u) => u.internalName);
    localStorage.setItem(UNLOCKS_KEY, JSON.stringify(internalNames));
}

export function loadUnlocks(): Unlocks[] {
    const raw = localStorage.getItem(UNLOCKS_KEY);
    if (!raw) return [];
    try {
        const names: string[] = JSON.parse(raw);
        return ALL_UNLOCKS.filter((u) => names.includes(u.internalName));
    } catch {
        return [];
    }
}
// initialization.ts
// This file will contain initialization logic and helpers for the blocks-game project.

export function createInitialGameState(): GameState {
    return {
        humanPlayer: {
            board: new BoardState(getInitialCubes('player', [])),
            totalScore: 0,
            boardScore: 0,
            maxBoardScore: 0,
            boardNumber: 1,
        },
        computerPlayer: {
            board: new BoardState(getInitialCubes('computer', [])),
            totalScore: 0,
            boardScore: 0,
            maxBoardScore: 0,
            boardNumber: 1,
        },
        unlockedUnlocks: [],
        accomplishedAchievements: [],
        gameStats: { largestGroup: 0, groupSizeCounts: {} },
    };
}
