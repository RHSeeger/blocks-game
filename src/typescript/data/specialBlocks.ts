import type { SpecialBlockSpawn } from '../types/SpecialBlockSpawn';
import { BOMB_BLOCK, COLOR_BLAST_BLOCK, LINE_BLOCK, PLUS1_BLOCK, REFILL_BLOCK } from './augmentations';
import {
    BIG_BOMB_CHANCE,
    BOMB_CHANCE,
    COLOR_BLAST_BASE_CHANCE,
    COLOR_BLAST_CHANCE,
    COLOR_BLAST_CHANCE_PER_LEVEL,
    LINE_CHANCE,
    PLUS1_CHANCE,
    PLUS2_CHANCE,
    REFILL_BASE_CHANCE,
    REFILL_CHANCE,
    REFILL_CHANCE_PER_LEVEL,
    SPECIAL_BLOCK_BASE_CHANCE,
    SPECIAL_BLOCK_CHANCE_PER_LEVEL,
} from './upgrades';

/**
 * Fixed values about special blocks, and how each kind gets onto new boards: the Augmentation that unlocks it, the
 * Upgrade that raises its chance, and its chances. Adding a kind of special block that appears on boards the same way
 * is a new entry in SPECIAL_BLOCK_SPAWNS.
 */

/** How many spaces out from itself a bomb block reaches, in every direction (1 is a 3x3 square) */
export const BOMB_RADIUS = 1;

/** How many spaces out from itself a big bomb reaches, in every direction (2 is a 5x5 square) */
export const BIG_BOMB_RADIUS = 2;

/** The usual chances, for every kind of special block except refill and Color Blast blocks */
const USUAL_CHANCES = { baseChance: SPECIAL_BLOCK_BASE_CHANCE, chancePerLevel: SPECIAL_BLOCK_CHANCE_PER_LEVEL };

/** Every kind of special block that can appear on new boards */
export const SPECIAL_BLOCK_SPAWNS: readonly SpecialBlockSpawn[] = [
    {
        augmentation: PLUS1_BLOCK,
        chanceUpgrade: PLUS1_CHANCE,
        types: ['plus1'],
        ...USUAL_CHANCES,
        bigger: { type: 'plus2', chanceUpgrade: PLUS2_CHANCE },
    },
    {
        augmentation: LINE_BLOCK,
        chanceUpgrade: LINE_CHANCE,
        types: ['lineHorizontal', 'lineVertical'],
        ...USUAL_CHANCES,
    },
    {
        augmentation: BOMB_BLOCK,
        chanceUpgrade: BOMB_CHANCE,
        types: ['bomb'],
        ...USUAL_CHANCES,
        bigger: { type: 'bigBomb', chanceUpgrade: BIG_BOMB_CHANCE },
    },
    {
        augmentation: REFILL_BLOCK,
        chanceUpgrade: REFILL_CHANCE,
        types: ['refill'],
        baseChance: REFILL_BASE_CHANCE,
        chancePerLevel: REFILL_CHANCE_PER_LEVEL,
    },
    {
        augmentation: COLOR_BLAST_BLOCK,
        chanceUpgrade: COLOR_BLAST_CHANCE,
        types: ['colorBlast'],
        baseChance: COLOR_BLAST_BASE_CHANCE,
        chancePerLevel: COLOR_BLAST_CHANCE_PER_LEVEL,
    },
];
