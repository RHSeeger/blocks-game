import type { PlayerState } from './PlayerState';
import type { GameStatistics } from './GameStatistics';
import type { Wallet } from './Wallet';

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
    /** The currencies available to spend on Upgrades */
    wallet: Wallet;
    /** The board score the human player must reach on a finished board to earn the next Gem (goes up each time) */
    gemGoalBoardScore: number;
    /**
     * When the computer player last took a turn (or caught up on time away), in milliseconds since 1970 (Date.now()).
     * A long gap since then is time away, which the computer catches up on (see playWhileAway)
     */
    computerLastTurnAt: number;
    /** Whether the player has closed the introduction ("how to play") pop-up shown when the game is first opened */
    introSeen: boolean;
    /**
     * The internalNames of the special block Augmentations whose explanation pop-up the human player has closed. A
     * special block they've unlocked that isn't in this list is explained next
     */
    specialBlocksExplained: string[];
};
