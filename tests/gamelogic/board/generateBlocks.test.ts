import { generateBlocks } from '../../../src/typescript/gamelogic/board/generateBlocks';
import { BLOCK_COLORS, BOARD_SIZE } from '../../../src/typescript/data/board';
import { PLUS1_BLOCK } from '../../../src/typescript/data/augmentations';

/**
 * Tests for generating a new board.
 */

describe('generateBlocks', () => {
    it('fills the board with regular blocks when the player has no Augmentations', () => {
        const blocks = generateBlocks([]);
        expect(blocks).toHaveLength(BOARD_SIZE);
        for (const block of blocks) {
            expect(BLOCK_COLORS).toContain(block.color);
            expect(block.special).toBeUndefined();
        }
    });

    it('adds one +1 block, away from the edges, when the player has the +1 Blocks Augmentation', () => {
        const blocks = generateBlocks([PLUS1_BLOCK]);
        const specialIndices = blocks.map((block, index) => (block.special ? index : -1)).filter((i) => i >= 0);
        expect(specialIndices).toHaveLength(1);
        const [index] = specialIndices;
        expect(blocks[index]).toEqual({ color: null, special: 'plus1' });
        const row = Math.floor(index / 10);
        const column = index % 10;
        expect(row).toBeGreaterThan(0);
        expect(row).toBeLessThan(9);
        expect(column).toBeGreaterThan(0);
        expect(column).toBeLessThan(9);
    });
});
