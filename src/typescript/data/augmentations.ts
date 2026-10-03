import type { Augmentation } from '../types/Augmentation';

/**
 * The list of all Augmentations in the game. Which ones each player has unlocked is stored in that player's state.
 */

/** internalName of the "+1 Blocks" Augmentation */
export const PLUS1_BLOCK = 'plus1Block';

/** internalName of the "Line Blocks" Augmentation */
export const LINE_BLOCK = 'lineBlock';

/** internalName of the "Bomb Blocks" Augmentation */
export const BOMB_BLOCK = 'bombBlock';

/** internalName of the "Greedy" Augmentation (computer player only) */
export const GREEDY = 'greedy';

/**
 * How many groups the computer player checks when choosing a move, once it has the Greedy Augmentation (before any
 * levels of the "Greedier" Upgrade)
 */
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
        internalName: LINE_BLOCK,
        displayName: 'Line Blocks',
        description:
            'Special line blocks can appear on the board. When one goes off, it removes every block in its row or column (the way its bar points).',
        players: ['human', 'computer'],
    },
    {
        internalName: BOMB_BLOCK,
        displayName: 'Bomb Blocks',
        description:
            'Special bomb blocks can appear on the board. When one goes off, it removes every block in the 3x3 square around it.',
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
