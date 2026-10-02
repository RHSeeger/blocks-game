import { generateBoard } from '../../../src/typescript/gamelogic/board/generateBlocks';
import { BLOCK_COLORS } from '../../../src/typescript/data/board';
import { PLUS1_BLOCK } from '../../../src/typescript/data/augmentations';

/**
 * Tests for generating a new board.
 */

describe('generateBoard', () => {
    it('fills a board of the given size with regular blocks when the player has no Augmentations', () => {
        const board = generateBoard(7, 4, []);
        expect(board.width).toBe(7);
        expect(board.height).toBe(4);
        expect(board.blocks).toHaveLength(28);
        for (const block of board.blocks) {
            expect(BLOCK_COLORS).toContain(block.color);
            expect(block.special).toBeUndefined();
        }
    });

    it('adds one +1 block, away from the edges, when the player has the +1 Blocks Augmentation', () => {
        const { blocks } = generateBoard(10, 10, [PLUS1_BLOCK]);
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

    it('still places a +1 block on a board too small to have spaces away from the edges', () => {
        const { blocks } = generateBoard(2, 2, [PLUS1_BLOCK]);
        expect(blocks.filter((block) => block.special === 'plus1')).toHaveLength(1);
    });
});
