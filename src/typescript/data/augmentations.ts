import type { Augmentation } from '../types/Augmentation';

/**
 * The list of all Augmentations in the game. Which ones each player has unlocked is stored in that player's state.
 */

/** internalName of the "+1 Blocks" Augmentation */
export const PLUS1_BLOCK = 'plus1Block';

/** internalName of the "Greedy" Augmentation (computer player only) */
export const GREEDY = 'greedy';

/** How many groups the computer player checks when choosing a move, once it has the Greedy Augmentation */
export const GREEDY_GROUPS_CHECKED = 3;

/** All Augmentations in the game */
export const ALL_AUGMENTATIONS: readonly Augmentation[] = [
    {
        internalName: PLUS1_BLOCK,
        displayName: '+1 Blocks',
        description: "Special '+1' blocks can appear on the board.",
        players: ['human', 'computer'],
    },
    {
        internalName: GREEDY,
        displayName: 'Greedy',
        description: `The computer player checks ${GREEDY_GROUPS_CHECKED} groups at random, and removes the one worth the most points.`,
        players: ['computer'],
    },
    {
        internalName: 'plus2Block',
        displayName: '+2 Blocks',
        description: "Special '+2' blocks can appear on the board.",
        players: ['human', 'computer'],
    },
    {
        internalName: 'x2Block',
        displayName: 'x2 Blocks',
        description: "Special 'x2' blocks can appear on the board.",
        players: ['human', 'computer'],
    },
];
