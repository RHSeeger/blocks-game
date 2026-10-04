/**
 * Defines the GameStatistics type: statistics tracked across the whole game.
 */

/**
 * Statistics tracked across the whole game.
 */
export type GameStatistics = {
    /** The largest group the human player has removed */
    largestGroup: number;
    /** How many groups of each size the human player has removed (size -> count) */
    groupSizeCounts: Record<number, number>;
    /** The fewest blocks left on a board the human player finished (special blocks count), or null before any */
    fewestBlocksLeft: number | null;
    /** How many boards the human player finished "tidy": with TIDY_BLOCKS_LEFT blocks left or fewer (spotless too) */
    tidyBoards: number;
    /** How many boards the human player finished with no blocks left */
    spotlessBoards: number;
};
