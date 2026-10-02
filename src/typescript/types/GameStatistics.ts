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
};
