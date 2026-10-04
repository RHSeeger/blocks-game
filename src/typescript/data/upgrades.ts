import type { Upgrade } from '../types/Upgrade';
import {
    BOMB_BLOCK,
    COLOR_BLAST_BLOCK,
    GREEDY,
    GREEDY_GROUPS_CHECKED,
    LINE_BLOCK,
    PLUS1_BLOCK,
    REFILL_BLOCK,
} from './augmentations';
import { AWAY_SPEED_KEPT_BY_LEVEL } from './away';
import { LARGEST_BOARD_SIZE, STARTING_BOARD_SIZE } from './board';

/**
 * The list of all Upgrades in the game, and the values their effects are based on. Each player's level for each
 * Upgrade is stored in that player's state.
 */

/** internalName of the "+1 Block Chance" Upgrade */
export const PLUS1_CHANCE = 'plus1Chance';

/** internalName of the "Line Block Chance" Upgrade */
export const LINE_CHANCE = 'lineChance';

/** internalName of the "Bomb Block Chance" Upgrade */
export const BOMB_CHANCE = 'bombChance';

/** internalName of the "Refill Block Chance" Upgrade */
export const REFILL_CHANCE = 'refillChance';

/** internalName of the "Color Blast Chance" Upgrade */
export const COLOR_BLAST_CHANCE = 'colorBlastChance';

/** internalName of the "+2 Block Chance" Upgrade (the chance of a +1 block being a +2 instead) */
export const PLUS2_CHANCE = 'plus2Chance';

/** internalName of the "Big Bomb Chance" Upgrade (the chance of a bomb block being a big bomb instead) */
export const BIG_BOMB_CHANCE = 'bigBombChance';

/** internalName of the "Greedier" Upgrade (computer only) */
export const GREEDY_GROUPS = 'greedyGroups';

/** internalName of the "Faster Computer" Upgrade (computer only) */
export const COMPUTER_SPEED = 'computerSpeed';

/** internalName of the "Bigger Board" Upgrade */
export const BOARD_SIZE = 'boardSize';

/** internalName of the "Better While Away" Upgrade (computer only; see AWAY_SPEED_KEPT_BY_LEVEL in data/away.ts) */
export const AWAY_PLAY = 'awayPlay';

/**
 * The chance of a special block on a new board, in percent, once its Augmentation is unlocked (before any levels of
 * its chance Upgrade). The same for every kind of special block except refill blocks (see REFILL_BASE_CHANCE)
 */
export const SPECIAL_BLOCK_BASE_CHANCE = 100;

/** How much each level of a special block's chance Upgrade (such as "+1 Block Chance") adds, in percent */
export const SPECIAL_BLOCK_CHANCE_PER_LEVEL = 25;

/**
 * Refill blocks appear at 40% of the rate of the other special blocks, at every level (40% to start, +10% a level),
 * since one is worth about 1.5 to 3 times as much as another special block when it appears (balanced 2026-10-03)
 */
export const REFILL_BASE_CHANCE = 40;
export const REFILL_CHANCE_PER_LEVEL = 10;

/**
 * Color Blast blocks appear at 20% of the rate of the usual special blocks, at every level (20% to start, +5% a
 * level), since one is worth about 3 to 14 times as much as another special block when it appears, the more the
 * bigger the board (balanced 2026-10-03)
 */
export const COLOR_BLAST_BASE_CHANCE = 20;
export const COLOR_BLAST_CHANCE_PER_LEVEL = 5;

/**
 * How much each level of a "bigger version" Upgrade (+2 Block Chance, Big Bomb Chance) adds to the chance of a block
 * being the bigger version, in percent, and its highest level (so the chance never goes above 50%)
 */
export const BIGGER_BLOCK_CHANCE_PER_LEVEL = 5;
export const BIGGER_BLOCK_MAX_LEVEL = 10;

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

/**
 * All Upgrades in the game. Everyday costs were multiplied by 2.5 on 2026-10-03, when scoring changed to size x size
 * (a typical board's score, and so the Coins and Chips it earns, went up about 2.5 times)
 */
export const ALL_UPGRADES: readonly Upgrade[] = [
    {
        internalName: PLUS1_CHANCE,
        displayName: '+1 Block Chance',
        description: `+${SPECIAL_BLOCK_CHANCE_PER_LEVEL}% chance of a +1 block on each new board. Over 100%, extra +1 blocks can appear.`,
        tier: 'everyday',
        players: ['human', 'computer'],
        requiresAugmentation: PLUS1_BLOCK,
        baseCost: 250,
        costScaling: 1.6,
        maxLevel: 12,
    },
    {
        internalName: LINE_CHANCE,
        displayName: 'Line Block Chance',
        description: `+${SPECIAL_BLOCK_CHANCE_PER_LEVEL}% chance of a line block on each new board. Over 100%, extra line blocks can appear.`,
        tier: 'everyday',
        players: ['human', 'computer'],
        requiresAugmentation: LINE_BLOCK,
        baseCost: 250,
        costScaling: 1.6,
        maxLevel: 12,
    },
    {
        internalName: BOMB_CHANCE,
        displayName: 'Bomb Block Chance',
        description: `+${SPECIAL_BLOCK_CHANCE_PER_LEVEL}% chance of a bomb block on each new board. Over 100%, extra bomb blocks can appear.`,
        tier: 'everyday',
        players: ['human', 'computer'],
        requiresAugmentation: BOMB_BLOCK,
        baseCost: 250,
        costScaling: 1.6,
        maxLevel: 12,
    },
    {
        internalName: REFILL_CHANCE,
        displayName: 'Refill Block Chance',
        description: `+${REFILL_CHANCE_PER_LEVEL}% chance of a refill block on each new board. Over 100%, extra refill blocks can appear.`,
        tier: 'everyday',
        players: ['human', 'computer'],
        requiresAugmentation: REFILL_BLOCK,
        baseCost: 250,
        costScaling: 1.6,
        maxLevel: 12,
    },
    {
        internalName: COLOR_BLAST_CHANCE,
        displayName: 'Color Blast Chance',
        description: `+${COLOR_BLAST_CHANCE_PER_LEVEL}% chance of a Color Blast block on each new board.`,
        tier: 'everyday',
        players: ['human', 'computer'],
        requiresAugmentation: COLOR_BLAST_BLOCK,
        baseCost: 250,
        costScaling: 1.6,
        maxLevel: 12,
    },
    {
        internalName: PLUS2_CHANCE,
        displayName: '+2 Block Chance',
        description: `+${BIGGER_BLOCK_CHANCE_PER_LEVEL}% chance of each +1 block being a +2 block instead (reaching 2 spaces further), up to ${BIGGER_BLOCK_CHANCE_PER_LEVEL * BIGGER_BLOCK_MAX_LEVEL}%.`,
        tier: 'everyday',
        players: ['human', 'computer'],
        requiresAugmentation: PLUS1_BLOCK,
        baseCost: 400,
        costScaling: 1.6,
        maxLevel: BIGGER_BLOCK_MAX_LEVEL,
    },
    {
        internalName: BIG_BOMB_CHANCE,
        displayName: 'Big Bomb Chance',
        description: `+${BIGGER_BLOCK_CHANCE_PER_LEVEL}% chance of each bomb block being a big bomb instead (clearing 5x5), up to ${BIGGER_BLOCK_CHANCE_PER_LEVEL * BIGGER_BLOCK_MAX_LEVEL}%.`,
        tier: 'everyday',
        players: ['human', 'computer'],
        requiresAugmentation: BOMB_BLOCK,
        baseCost: 400,
        costScaling: 1.6,
        maxLevel: BIGGER_BLOCK_MAX_LEVEL,
    },
    {
        internalName: GREEDY_GROUPS,
        displayName: 'Greedier',
        description: 'Greedy checks more groups before choosing one. The last level checks every group.',
        tier: 'everyday',
        players: ['computer'],
        requiresAugmentation: GREEDY,
        baseCost: 250,
        costScaling: 2,
        maxLevel: GREEDY_GROUPS_BY_LEVEL.length - 1,
    },
    {
        internalName: COMPUTER_SPEED,
        displayName: 'Faster Computer',
        description: `The computer player takes its turns ${Math.round((1 - COMPUTER_SPEED_FACTOR_PER_LEVEL) * 100)}% faster.`,
        tier: 'everyday',
        players: ['computer'],
        baseCost: 75,
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
        // The computer's board has 10 levels, not 4: doubling would make its last level cost 1,536 Gems (3,069 for all
        // of them). At x1.5, all 10 cost 340, and its first 5 about the same as the human's 4 (changed 2026-10-03)
        costScaling: 2,
        costScalingByPlayer: { human: 2, computer: 1.5 },
        maxLevelByPlayer: {
            human: (LARGEST_BOARD_SIZE.human - STARTING_BOARD_SIZE.human) / BOARD_SIZE_PER_LEVEL,
            computer: (LARGEST_BOARD_SIZE.computer - STARTING_BOARD_SIZE.computer) / BOARD_SIZE_PER_LEVEL,
        },
    },
    {
        internalName: AWAY_PLAY,
        displayName: 'Better While Away',
        description:
            "Time away is worth more: the computer slows down less the longer you're away. At the last level, a night away (8 hours) is worth almost 3 hours of play, instead of under 1.",
        tier: 'gameChanging',
        players: ['computer'],
        baseCost: 5,
        costScaling: 2,
        maxLevel: AWAY_SPEED_KEPT_BY_LEVEL.length - 1,
    },
];
