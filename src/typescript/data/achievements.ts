import type { Achievement } from '../types/Achievement';
import { PLUS1_BLOCK } from './augmentations';

/**
 * The list of all achievements in the game. Which ones have been accomplished is stored in the game state.
 */

/** internalName of the "No, not like that. Let me show you" achievement */
export const NO_NOT_LIKE_THAT = 'no_not_like_that';

/** All achievements in the game */
export const ALL_ACHIEVEMENTS: readonly Achievement[] = [
    {
        internalName: 'score_1000',
        displayName: 'Score 1000!',
        description: 'Reach a total score of 1000 points.',
    },
    {
        internalName: 'group_20',
        displayName: 'Big Group!',
        description: 'Remove a group of 20 or more blocks at once.',
    },
    {
        internalName: 'first_clear',
        displayName: 'First Board Clear',
        description: 'Clear your first board.',
        unlocks: { augmentation: PLUS1_BLOCK, player: 'human' },
    },
    {
        internalName: NO_NOT_LIKE_THAT,
        displayName: 'No, not like that. Let me show you',
        description: 'Remove a group of 2 blocks with a +1 block connected.',
        unlocks: { augmentation: PLUS1_BLOCK, player: 'computer' },
    },
];
