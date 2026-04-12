/**
 * Read-only view for GameStatistics, for UI display only.
 */
export interface GameStatisticsView {
    readonly largestGroup: number;
    readonly groupSizeCounts: Readonly<Record<number, number>>;
}
