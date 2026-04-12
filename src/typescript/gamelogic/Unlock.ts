// Unlocks type definition for the Blocks Game
// Represents a game unlock (e.g., +2 Bricks, x2 Bricks, etc.)

import type { UnlockView } from '../bridge/UnlockView';
export type Unlock = UnlockView & {
    internalName: string; // Unique, stable identifier for save/load
    displayName: string; // Shown to the player
    description: string; // Description for the UI
};
