// List of all possible unlocks in the game
// Add new unlocks here as needed
import type { Unlocks } from './unlocks';

export const ALL_UNLOCKS: Unlocks[] = [
    {
        internalName: 'plus2Bricks',
        displayName: '+2 Bricks',
        description: "Allows special '+2' bricks to be added to the board.",
    },
    {
        internalName: 'x2Bricks',
        displayName: 'x2 Bricks',
        description: "Allows special 'x2' bricks to be added to the board.",
    },
    {
        internalName: 'plus1Bricks',
        displayName: '+1 Bricks',
        description: "Allows special '+1' bricks to be added to the Human Player's board.",
    },
    {
        internalName: 'plus1Bricks_computer',
        displayName: '+1 Bricks (Computer)',
        description: "+1 Bricks can now appear on the computer's board",
    },
    // Add more unlocks as needed
];
