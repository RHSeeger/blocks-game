import { generateBoard } from '../../../src/typescript/gamelogic/board/generateBoard';
import { BLOCK_COLORS } from '../../../src/typescript/data/board';

/**
 * Tests for generating a new board.
 */

describe('generateBoard', () => {
    it('fills a board of the given size with regular blocks when there are no special blocks', () => {
        const board = generateBoard(7, 4);
        expect(board.width).toBe(7);
        expect(board.height).toBe(4);
        expect(board.blocks).toHaveLength(28);
        for (const block of board.blocks) {
            expect(BLOCK_COLORS).toContain(block.color);
            expect(block.special).toBeUndefined();
        }
    });

    it('adds one +1 block, away from the edges, when asked for one', () => {
        const { blocks } = generateBoard(10, 10, ['plus1']);
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

    it('places several special blocks, of the kinds asked for, each in a different space', () => {
        const { blocks } = generateBoard(10, 10, ['plus1', 'plus1', 'lineHorizontal', 'lineVertical']);
        expect(blocks.filter((block) => block.special === 'plus1')).toHaveLength(2);
        expect(blocks.filter((block) => block.special === 'lineHorizontal')).toHaveLength(1);
        expect(blocks.filter((block) => block.special === 'lineVertical')).toHaveLength(1);
    });

    it('places no more special blocks than there are spaces away from the edges', () => {
        // A 3x3 board has only one space away from the edges
        const { blocks } = generateBoard(3, 3, ['plus1', 'plus1', 'plus1', 'plus1', 'plus1']);
        expect(blocks.filter((block) => block.special === 'plus1')).toHaveLength(1);
    });

    it('still places a special block on a board too small to have spaces away from the edges', () => {
        const { blocks } = generateBoard(2, 2, ['plus1']);
        expect(blocks.filter((block) => block.special === 'plus1')).toHaveLength(1);
    });
});
