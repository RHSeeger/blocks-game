/**
 * Read-only view for Achievement, for UI display only.
 */
export interface AchievementView {
    readonly internalName: string;
    readonly displayName: string;
    readonly description: string;
    readonly unlocks?: string;
}
