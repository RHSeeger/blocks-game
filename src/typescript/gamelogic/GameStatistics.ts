// GameStatistics type
// ------------------
// This file defines the GameStatistics type, which represents the statistics for a game session.

import type { GameStatisticsView } from '../bridge/GameStatisticsView';

export type GameStatistics = GameStatisticsView & {
    // Add any additional mutable/stat-tracking properties here
};
