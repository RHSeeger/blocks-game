import type { SpecialBlockExplanation } from '../types/SpecialBlockExplanation';
import { BOMB_BLOCK, LINE_BLOCK, PLUS1_BLOCK, REFILL_BLOCK } from '../data/augmentations';

/**
 * The text and pictures of the pop-ups explaining each special block, when the human player unlocks it. Written for
 * players (like the How to Play tab); the pictures show a move selected, so it's clear what the block adds.
 */

/** Said at the end of every explanation */
const CHAINS = 'Special blocks set each other off too, so look out for chains.';

/** The explanation for each special block Augmentation, by its internalName */
export const SPECIAL_BLOCK_EXPLANATIONS: Readonly<Record<string, SpecialBlockExplanation>> = {
    [PLUS1_BLOCK]: {
        title: 'New: +1 Blocks',
        pictures: [['Y G B Y G', 'B G! Y! B O', 'G! R! R! +1! B', 'O B! G! Y O', 'Y O B G Y']],
        paragraphs: [
            'When the group you remove touches a +1 block, every block touching your group goes too, whatever its color.',
            'They add up: each +1 reaches one space further, so two +1 blocks remove everything up to 2 spaces away.',
            CHAINS,
        ],
    },
    [LINE_BLOCK]: {
        title: 'New: Line Blocks',
        pictures: [['Y G B Y G', 'B R! R! G O', 'G! O! H! B! Y!', 'O B G Y O', 'Y O B G B']],
        paragraphs: [
            'When the group you remove touches a line block, every block in its row goes too (or in its column, if the bar is upright).',
            CHAINS,
        ],
    },
    [BOMB_BLOCK]: {
        title: 'New: Bomb Blocks',
        pictures: [['Y G B Y G', 'B O! Y! G! O', 'G R! *! B! Y', 'O R! G! Y! O', 'Y O B G B']],
        paragraphs: [
            'When the group you remove touches a bomb block, every block in the 3x3 square around it goes too.',
            CHAINS,
        ],
    },
    [REFILL_BLOCK]: {
        title: 'New: Refill Blocks',
        pictures: [
            ['. . . . .', '. . . . .', 'G Y . . .', 'B R! R! G .', 'Y G F! B O'],
            ['O B G Y R', 'G Y O B G', 'R O B Y O', 'G Y G Y B', 'B Y G B O'],
        ],
        paragraphs: [
            'When the group you remove touches a refill block, the board fills back up: once the blocks have settled, new blocks drop in to fill every empty space.',
            'The new blocks can include your other special blocks, but never another refill block.',
            CHAINS,
        ],
    },
};
