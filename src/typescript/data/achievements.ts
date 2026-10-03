import type { Achievement } from '../types/Achievement';
import { BOMB_BLOCK, GREEDY, LINE_BLOCK, PLUS1_BLOCK, REFILL_BLOCK } from './augmentations';

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

/** internalName of the "You call that a line? Let me show you" achievement */
export const LINE_NOT_LIKE_THAT = 'line_not_like_that';

/** internalName of the "You call that an explosion? Let me show you" achievement */
export const BOMB_NOT_LIKE_THAT = 'bomb_not_like_that';

/** internalName of the "Chain Reaction" achievement */
export const CHAIN_REACTION = 'chain_reaction';

/** internalName of the "You call that a refill? Let me show you" achievement */
export const REFILL_NOT_LIKE_THAT = 'refill_not_like_that';

/** internalName of the "Spotless" achievement */
export const CLEARED_BOARD = 'cleared_board';

/** internalName of the "Taste the Rainbow" achievement */
export const EVERY_COLOR_LEFT = 'every_color_left';

/** How many Gems each achievement gives when it is accomplished */
export const ACHIEVEMENT_GEMS = 2;

/** All achievements in the game */
export const ALL_ACHIEVEMENTS: readonly Achievement[] = [
    {
        internalName: SCORE_1000,
        displayName: 'Score 1000!',
        description: 'Reach a total score of 1000 points.',
        gems: ACHIEVEMENT_GEMS,
        unlocks: { augmentation: LINE_BLOCK, player: 'human' },
    },
    {
        internalName: GROUP_20,
        displayName: 'Big Group!',
        description: 'Remove a group of 20 or more blocks at once.',
        gems: ACHIEVEMENT_GEMS,
        unlocks: { augmentation: GREEDY, player: 'computer' },
    },
    {
        internalName: FIRST_CLEAR,
        displayName: 'First Board Clear',
        description: 'Finish your first board (no valid moves left).',
        gems: ACHIEVEMENT_GEMS,
        unlocks: { augmentation: PLUS1_BLOCK, player: 'human' },
    },
    {
        internalName: NO_NOT_LIKE_THAT,
        displayName: 'No, not like that. Let me show you',
        description: 'Remove a group of 2 blocks with a +1 block connected.',
        gems: ACHIEVEMENT_GEMS,
        unlocks: { augmentation: PLUS1_BLOCK, player: 'computer' },
    },
    {
        internalName: LINE_NOT_LIKE_THAT,
        displayName: 'You call that a line? Let me show you',
        description: 'Remove a group of 2 blocks with a line block connected.',
        gems: ACHIEVEMENT_GEMS,
        unlocks: { augmentation: LINE_BLOCK, player: 'computer' },
    },
    {
        internalName: BOMB_NOT_LIKE_THAT,
        displayName: 'You call that an explosion? Let me show you',
        description: 'Remove a group of 2 blocks with a bomb block connected.',
        gems: ACHIEVEMENT_GEMS,
        unlocks: { augmentation: BOMB_BLOCK, player: 'computer' },
    },
    {
        internalName: CHAIN_REACTION,
        displayName: 'Chain Reaction',
        description: 'Set off 3 or more special blocks in one move.',
        gems: ACHIEVEMENT_GEMS,
        unlocks: { augmentation: REFILL_BLOCK, player: 'human' },
    },
    {
        internalName: REFILL_NOT_LIKE_THAT,
        displayName: 'You call that a refill? Let me show you',
        description: 'Remove a group of 2 blocks with a refill block connected.',
        gems: ACHIEVEMENT_GEMS,
        unlocks: { augmentation: REFILL_BLOCK, player: 'computer' },
    },
    {
        internalName: CLEARED_BOARD,
        displayName: 'Spotless',
        description: 'Finish a board with no blocks left on it.',
        gems: ACHIEVEMENT_GEMS,
    },
    {
        internalName: EVERY_COLOR_LEFT,
        displayName: 'Taste the Rainbow',
        description: 'Finish a board with at least one block of every color left on it.',
        gems: ACHIEVEMENT_GEMS,
        unlocks: { augmentation: BOMB_BLOCK, player: 'human' },
    },
];
