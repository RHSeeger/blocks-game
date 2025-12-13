export interface Achievement {
  /**
   * Internal unique identifier for this achievement. Used for save/load and never changes.
   */
  internalName: string;
  /**
   * Display name for the achievement (can change over time).
   */
  displayName: string;
  /**
   * Description of what the achievement means or how it is earned.
   */
  description: string;
}
