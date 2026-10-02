import type { GameState } from '../types/GameState';
import type { PlayerState } from '../types/PlayerState';
import { STARTING_BOARD_HEIGHT, STARTING_BOARD_WIDTH } from '../data/board';
import { GEM_GOAL_STARTING_BOARD_SCORE } from '../data/gems';
import { generateBoard } from './board/generateBlocks';

/**
 * Creates the game state for a brand new game.
 */

/**
 * Creates the game state for a brand new game.
 *
 * @returns A new game state
 */
export function createInitialGameState(): GameState {
    return {
        humanPlayer: createPlayerState(),
        computerPlayer: createPlayerState(),
        accomplishedAchievements: [],
        gameStats: { largestGroup: 0, groupSizeCounts: {} },
        wallet: { coins: 0, chips: 0, gems: 0 },
        gemGoalBoardScore: GEM_GOAL_STARTING_BOARD_SCORE,
    };
}

/**
 * Creates the state for a player who is just starting: no score, no Augmentations or Upgrades, on board 1.
 *
 * @returns A new player state
 */
function createPlayerState(): PlayerState {
    return {
        board: generateBoard(STARTING_BOARD_WIDTH, STARTING_BOARD_HEIGHT, 0),
        totalScore: 0,
        boardScore: 0,
        maxBoardScore: 0,
        boardNumber: 1,
        selectedIndices: [],
        augmentations: [],
        upgradeLevels: {},
    };
}
