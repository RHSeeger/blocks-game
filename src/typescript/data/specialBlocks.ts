import type { SpecialBlockSpawn } from '../types/SpecialBlockSpawn';
import { BOMB_BLOCK, LINE_BLOCK, PLUS1_BLOCK, REFILL_BLOCK } from './augmentations';
import {
    BOMB_CHANCE,
    LINE_CHANCE,
    PLUS1_CHANCE,
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

/** The usual chances, for every kind of special block except refill blocks */
const USUAL_CHANCES = { baseChance: SPECIAL_BLOCK_BASE_CHANCE, chancePerLevel: SPECIAL_BLOCK_CHANCE_PER_LEVEL };

/** Every kind of special block that can appear on new boards */
export const SPECIAL_BLOCK_SPAWNS: readonly SpecialBlockSpawn[] = [
    { augmentation: PLUS1_BLOCK, chanceUpgrade: PLUS1_CHANCE, types: ['plus1'], ...USUAL_CHANCES },
    {
        augmentation: LINE_BLOCK,
        chanceUpgrade: LINE_CHANCE,
        types: ['lineHorizontal', 'lineVertical'],
        ...USUAL_CHANCES,
    },
    { augmentation: BOMB_BLOCK, chanceUpgrade: BOMB_CHANCE, types: ['bomb'], ...USUAL_CHANCES },
    {
        augmentation: REFILL_BLOCK,
        chanceUpgrade: REFILL_CHANCE,
        types: ['refill'],
        baseChance: REFILL_BASE_CHANCE,
        chancePerLevel: REFILL_CHANCE_PER_LEVEL,
    },
];
