import type { Achievement } from '../types/Achievement';
import { GREEDY, PLUS1_BLOCK } from './augmentations';

/**
 * The list of all achievements in the game. Which ones have been accomplished is stored in the game state.
 */

/** internalName of the "Score 1000!" achievement */
export const SCORE_1000 = 'score_1000';

/** internalName of the "Big Group!" achievement */
export const GROUP_20 = 'group_20';

/** internalName of the "First Board Clear" achievement */
export const FIRST_CLEAR = 'first_clear';

/** internalName of the "No, not like that. Let me show you" achievement */
export const NO_NOT_LIKE_THAT = 'no_not_like_that';

/** internalName of the "Spotless" achievement */
export const CLEARED_BOARD = 'cleared_board';

/** internalName of the "Taste the Rainbow" achievement */
export const EVERY_COLOR_LEFT = 'every_color_left';

/** All achievements in the game */
export const ALL_ACHIEVEMENTS: readonly Achievement[] = [
    {
        internalName: SCORE_1000,
        displayName: 'Score 1000!',
        description: 'Reach a total score of 1000 points.',
    },
    {
        internalName: GROUP_20,
        displayName: 'Big Group!',
        description: 'Remove a group of 20 or more blocks at once.',
        unlocks: { augmentation: GREEDY, player: 'computer' },
    },
    {
        internalName: FIRST_CLEAR,
        displayName: 'First Board Clear',
        description: 'Finish your first board (no valid moves left).',
        unlocks: { augmentation: PLUS1_BLOCK, player: 'human' },
    },
    {
        internalName: NO_NOT_LIKE_THAT,
        displayName: 'No, not like that. Let me show you',
        description: 'Remove a group of 2 blocks with a +1 block connected.',
        unlocks: { augmentation: PLUS1_BLOCK, player: 'computer' },
    },
    {
        internalName: CLEARED_BOARD,
        displayName: 'Spotless',
        description: 'Finish a board with no blocks left on it.',
    },
    {
        internalName: EVERY_COLOR_LEFT,
        displayName: 'Taste the Rainbow',
        description: 'Finish a board with at least one block of every color left on it.',
    },
];
