import type { PlayerState } from './PlayerState';
import type { GameStatistics } from './GameStatistics';

/**
 * Defines the GameState type: all of the game's state, in one plain-data object.
 * See design/code-design.md ("Game State") for how it is owned and passed around.
 */

/**
 * All of the game's state. Plain data (no classes or methods), so it can be saved as JSON and given to the UI as
 * read-only.
 */
export type GameState = {
    humanPlayer: PlayerState;
    computerPlayer: PlayerState;
    /** The internalNames of the achievements that have been accomplished */
    accomplishedAchievements: string[];
    gameStats: GameStatistics;
};
