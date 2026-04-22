// achievements-list.ts
// -------------------
// Contains the list of all possible achievements in the game.
//
import type { Achievement } from './Achievement';

// Example achievements. Add more as needed.
export const ALL_ACHIEVEMENTS: Achievement[] = [
    {
        internalName: 'score_1000',
        displayName: 'Score 1000!',
        description: 'Reach a total score of 1000 points.',
    },
    {
        internalName: 'group_20',
        displayName: 'Big Group!',
        description: 'Remove a group of 20 or more cubes at once.',
    },
    {
        internalName: 'first_clear',
        displayName: 'First Board Clear',
        description: 'Clear your first board.',
        unlocks: 'plus1Bricks',
    },
    {
        internalName: 'no_not_like_that',
        displayName: 'No, not like that. Let me show you',
        description: 'Remove a group of 2 blocks with a +1 block connected.',
        unlocks: 'plus1Bricks_computer',
    },
];
