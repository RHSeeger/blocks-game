// GameStats type and file
// ----------------------
// This file defines the GameStats type, which tracks statistics for the entire game, including both the player and the computer.
// For example, it may track the largest block group removed for the player and the largest block group removed by the computer separately.
// Used for displaying and persisting game statistics (e.g., in the Stats tab).

export type GameStats = {
    largestGroup: number;
    groupSizeCounts: Record<number, number>;
};
