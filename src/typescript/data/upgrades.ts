import type { Upgrade } from '../types/Upgrade';
import { GREEDY, GREEDY_GROUPS_CHECKED, PLUS1_BLOCK } from './augmentations';

/**
 * The list of all Upgrades in the game, and the values their effects are based on. Each player's level for each
 * Upgrade is stored in that player's state.
 */

/** internalName of the "+1 Block Chance" Upgrade */
export const PLUS1_CHANCE = 'plus1Chance';

/** internalName of the "Greedier" Upgrade (computer only) */
export const GREEDY_GROUPS = 'greedyGroups';

/** internalName of the "Faster Computer" Upgrade (computer only) */
export const COMPUTER_SPEED = 'computerSpeed';

/** internalName of the "Bigger Board" Upgrade */
export const BOARD_SIZE = 'boardSize';

/** The chance of a +1 block on a new board, in percent, once +1 Blocks is unlocked (before any Upgrade levels) */
export const PLUS1_BASE_CHANCE = 100;

/** How much each level of "+1 Block Chance" adds to the chance, in percent */
export const PLUS1_CHANCE_PER_LEVEL = 25;

/**
 * How many groups Greedy checks at each level of "Greedier" (index = level). The last level checks every group.
 */
export const GREEDY_GROUPS_BY_LEVEL: readonly number[] = [GREEDY_GROUPS_CHECKED, 5, 8, Infinity];

/** How long the computer player waits between turns, in milliseconds, before any "Faster Computer" levels */
export const COMPUTER_BASE_TURN_MS = 1000;

/** Each level of "Faster Computer" multiplies the time between turns by this */
export const COMPUTER_SPEED_FACTOR_PER_LEVEL = 0.8;

/** How many columns and rows each level of "Bigger Board" adds */
export const BOARD_SIZE_PER_LEVEL = 1;

/** All Upgrades in the game */
export const ALL_UPGRADES: readonly Upgrade[] = [
    {
        internalName: PLUS1_CHANCE,
        displayName: '+1 Block Chance',
        description: `+${PLUS1_CHANCE_PER_LEVEL}% chance of a +1 block on each new board. Over 100%, extra +1 blocks can appear.`,
        tier: 'everyday',
        players: ['human', 'computer'],
        requiresAugmentation: PLUS1_BLOCK,
        baseCost: 100,
        costScaling: 1.6,
        maxLevel: 12,
    },
    {
        internalName: GREEDY_GROUPS,
        displayName: 'Greedier',
        description: 'Greedy checks more groups before choosing one. The last level checks every group.',
        tier: 'everyday',
        players: ['computer'],
        requiresAugmentation: GREEDY,
        baseCost: 100,
        costScaling: 2,
        maxLevel: GREEDY_GROUPS_BY_LEVEL.length - 1,
    },
    {
        internalName: COMPUTER_SPEED,
        displayName: 'Faster Computer',
        description: `The computer player takes its turns ${Math.round((1 - COMPUTER_SPEED_FACTOR_PER_LEVEL) * 100)}% faster.`,
        tier: 'everyday',
        players: ['computer'],
        baseCost: 30,
        costScaling: 1.6,
        maxLevel: 8,
    },
    {
        internalName: BOARD_SIZE,
        displayName: 'Bigger Board',
        description: `Adds ${BOARD_SIZE_PER_LEVEL} column and ${BOARD_SIZE_PER_LEVEL} row to the board, starting with the next board.`,
        tier: 'gameChanging',
        players: ['human', 'computer'],
        baseCost: 3,
        costScaling: 2,
        maxLevel: 5,
    },
];
