// initialization.ts
// This file will contain initialization logic and helpers for the blocks-game project.


import { BoardState, getInitialCubes } from "./board";
import type { GameState } from "./gameState";

export function createInitialGameState(): GameState {
	return {
		humanPlayer: {
			board: new BoardState(getInitialCubes('player')),
			playerHealth: 100,
			playerScore: 0,
			boardNumber: 1,
		},
		computerPlayer: {
			board: new BoardState(getInitialCubes('computer')),
			playerHealth: 100,
			playerScore: 0,
			boardNumber: 1,
		},
		unlockedUnlocks: [],
		accomplishedAchievements: [],
		gameStats: { largestGroup: 0, groupSizeCounts: {} },
	};
}
