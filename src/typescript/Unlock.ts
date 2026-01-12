// Unlocks type definition for the Blocks Game
// Represents a game unlock (e.g., +2 Bricks, x2 Bricks, etc.)

export type Unlock = {
    internalName: string; // Unique, stable identifier for save/load
    displayName: string; // Shown to the player
    description: string; // Description for the UI
};
