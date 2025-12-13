// List of all possible unlocks in the game
// Add new unlocks here as needed
import type { Unlocks } from "./unlocks";

export const ALL_UNLOCKS: Unlocks[] = [
    {
        internalName: "plus2Bricks",
        displayName: "+2 Bricks",
        description: "Start each board with 2 extra bricks."
    },
    {
        internalName: "x2Bricks",
        displayName: "x2 Bricks",
        description: "Double the number of bricks on each board."
    }
    // Add more unlocks as needed
];
