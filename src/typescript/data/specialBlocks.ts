import type { SpecialBlockSpawn } from '../types/SpecialBlockSpawn';
import { LINE_BLOCK, PLUS1_BLOCK } from './augmentations';
import { LINE_CHANCE, PLUS1_CHANCE } from './upgrades';

/**
 * How each kind of special block gets onto new boards: the Augmentation that unlocks it, and the Upgrade that raises
 * its chance. Adding a kind of special block that appears on boards the same way is a new entry here.
 */

/** Every kind of special block that can appear on new boards */
export const SPECIAL_BLOCK_SPAWNS: readonly SpecialBlockSpawn[] = [
    { augmentation: PLUS1_BLOCK, chanceUpgrade: PLUS1_CHANCE, types: ['plus1'] },
    { augmentation: LINE_BLOCK, chanceUpgrade: LINE_CHANCE, types: ['lineHorizontal', 'lineVertical'] },
];
