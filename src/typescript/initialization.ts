import { ALL_ACHIEVEMENTS } from "./achievements-list";
import { ALL_UNLOCKS } from "./unlocks-list";
import type { GameStats } from "./gameStats";
import type { Achievement } from "./achievement";
import type { PlayerState } from "./playerState";
import type { Unlocks } from "./unlocks";

const PLAYER_STATS_KEY = "blocksPlayerStats";
const LOCAL_STORAGE_KEY = "blocksGameState";
const ACHIEVEMENTS_KEY = "blocksAchievements";
const UNLOCKS_KEY = "blocksUnlocks";

export function loadGameStateFromStorage(gameState: any) {
	const playerRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
	let foundPlayer = false;
	if (playerRaw) {
		try {
			const state = JSON.parse(playerRaw);
			if (state && state.board && Array.isArray(state.board.cubes)) {
				gameState.humanPlayer = {
					board: new BoardState(state.board.cubes),
					playerScore: state.playerScore,
					boardNumber: state.boardNumber,
				};
				foundPlayer = true;
			} else if (state && state.cubes && Array.isArray(state.cubes)) {
				gameState.humanPlayer = {
					board: new BoardState(state.cubes),
					playerScore: state.playerScore,
					boardNumber: state.boardNumber,
				};
				foundPlayer = true;
			}
		} catch {}
	}
	if (!foundPlayer) {
		gameState.humanPlayer = {
			board: new BoardState(getInitialCubes('player')),
			playerScore: 0,
			boardNumber: 1,
		};
	}
	const statsRaw = localStorage.getItem(PLAYER_STATS_KEY);
	let foundStats = false;
	if (statsRaw) {
		try {
			const stats = JSON.parse(statsRaw);
			if (typeof stats.largestGroup === 'number' && typeof stats.groupSizeCounts === 'object') {
				gameState.gameStats = stats;
				foundStats = true;
			}
		} catch {}
	}
	if (!foundStats) {
		gameState.gameStats = { largestGroup: 0, groupSizeCounts: {} };
	}
	const achRaw = localStorage.getItem(ACHIEVEMENTS_KEY);
	let foundAchievements = false;
	if (achRaw) {
		try {
			const names: string[] = JSON.parse(achRaw);
			gameState.accomplishedAchievements = ALL_ACHIEVEMENTS.filter(a => names.includes(a.internalName));
			foundAchievements = true;
		} catch {}
	}
	if (!foundAchievements) {
		gameState.accomplishedAchievements = [];
	}
	const unlocksRaw = localStorage.getItem(UNLOCKS_KEY);
	let foundUnlocks = false;
	if (unlocksRaw) {
		try {
			const names: string[] = JSON.parse(unlocksRaw);
			gameState.unlockedUnlocks = ALL_UNLOCKS.filter(u => names.includes(u.internalName));
			foundUnlocks = true;
		} catch {}
	}
	if (!foundUnlocks) {
		gameState.unlockedUnlocks = [];
	}
}

export function savePlayerStats(stats: GameStats) {
	localStorage.setItem(PLAYER_STATS_KEY, JSON.stringify(stats));
}

export function saveGameState(state: PlayerState) {
	localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
	// @ts-ignore
	window.gameState = state;
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
	const internalNames = achieved.map(a => a.internalName);
	localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(internalNames));
}

export function loadAchievements(): Achievement[] {
	const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
	if (!raw) return [];
	try {
		const names: string[] = JSON.parse(raw);
		return ALL_ACHIEVEMENTS.filter(a => names.includes(a.internalName));
	} catch {
		return [];
	}
}

export function saveUnlocks(unlocked: Unlocks[]) {
	const internalNames = unlocked.map(u => u.internalName);
	localStorage.setItem(UNLOCKS_KEY, JSON.stringify(internalNames));
}

export function loadUnlocks(): Unlocks[] {
	const raw = localStorage.getItem(UNLOCKS_KEY);
	if (!raw) return [];
	try {
		const names: string[] = JSON.parse(raw);
		return ALL_UNLOCKS.filter(u => names.includes(u.internalName));
	} catch {
		return [];
	}
}
// initialization.ts
// This file will contain initialization logic and helpers for the blocks-game project.


import { BoardState, getInitialCubes } from "./board";
import type { GameState } from "./gameState";

export function createInitialGameState(): GameState {
	return {
		humanPlayer: {
			board: new BoardState(getInitialCubes('player')),
			playerScore: 0,
			boardNumber: 1,
		},
		computerPlayer: {
			board: new BoardState(getInitialCubes('computer')),
			playerScore: 0,
			boardNumber: 1,
		},
		unlockedUnlocks: [],
		accomplishedAchievements: [],
		gameStats: { largestGroup: 0, groupSizeCounts: {} },
	};
}
