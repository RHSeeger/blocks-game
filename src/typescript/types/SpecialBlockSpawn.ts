import type { SpecialBlockType } from './SpecialBlockType';

/**
 * Defines the SpecialBlockSpawn type: how one kind of special block gets onto new boards.
 */

/**
 * How one kind of special block gets onto new boards. Once a player has the Augmentation, each new board rolls how
 * many of these blocks it gets, from a chance that the chance Upgrade raises (see getSpecialBlockChance). The list is in
 * data/specialBlocks.ts.
 */
export type SpecialBlockSpawn = {
    /** The Augmentation a player needs before these blocks appear on their boards */
    augmentation: string;
    /** The internalName of the Upgrade that raises the chance of these blocks appearing */
    chanceUpgrade: string;
    /** The special block types placed. When there is more than one, each block placed is one of them, at random */
    types: readonly SpecialBlockType[];
    /** The chance of one appearing on a new board, in percent, once the Augmentation is unlocked (before any levels) */
    baseChance: number;
    /** How much each level of the chance Upgrade adds to the chance, in percent */
    chancePerLevel: number;
    /**
     * A bigger version of this kind of block, if it has one (such as a +2 for a +1): each block placed has a chance to
     * be the bigger version instead, which the `chanceUpgrade` here raises (see getBiggerBlockChance)
     */
    bigger?: { type: SpecialBlockType; chanceUpgrade: string };
};
