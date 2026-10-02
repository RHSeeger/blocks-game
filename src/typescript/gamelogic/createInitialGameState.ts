import type { GameState } from '../types/GameState';
import type { PlayerState } from '../types/PlayerState';
import { generateBlocks } from './board/generateBlocks';

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
    };
}

/**
 * Creates the state for a player who is just starting: no score, no Augmentations, on board 1.
 *
 * @returns A new player state
 */
function createPlayerState(): PlayerState {
    return {
        board: { blocks: generateBlocks([]) },
        totalScore: 0,
        boardScore: 0,
        maxBoardScore: 0,
        boardNumber: 1,
        selectedIndices: [],
        augmentations: [],
    };
}
