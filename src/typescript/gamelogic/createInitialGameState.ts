import type { GameState } from '../types/GameState';
import type { PlayerId } from '../types/PlayerId';
import type { PlayerState } from '../types/PlayerState';
import { STARTING_BOARD_SIZE } from '../data/board';
import { GEM_GOAL_STARTING_BOARD_SCORE } from '../data/gems';
import { generateBoard } from './board/generateBoard';

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
        humanPlayer: createPlayerState('human'),
        computerPlayer: createPlayerState('computer'),
        accomplishedAchievements: [],
        gameStats: { largestGroup: 0, groupSizeCounts: {} },
        wallet: { coins: 0, chips: 0, gems: 0 },
        gemGoalBoardScore: GEM_GOAL_STARTING_BOARD_SCORE,
        computerLastTurnAt: Date.now(),
        introSeen: false,
    };
}

/**
 * Creates the state for a player who is just starting: no score, no Augmentations or Upgrades, on board 1 (at the
 * player's starting board size).
 *
 * @param player - Which player it is
 * @returns A new player state
 */
function createPlayerState(player: PlayerId): PlayerState {
    const size = STARTING_BOARD_SIZE[player];
    return {
        board: generateBoard(size, size),
        totalScore: 0,
        boardScore: 0,
        maxBoardScore: 0,
        boardNumber: 1,
        selectedIndices: [],
        augmentations: [],
        upgradeLevels: {},
    };
}
