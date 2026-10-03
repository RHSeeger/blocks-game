import { generateBoard, refillBoard } from '../../../src/typescript/gamelogic/board/generateBoard';
import { BLOCK_COLORS } from '../../../src/typescript/data/board';
import { boardWith, plus1, regular } from '../../helpers/testBoards';

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

describe('refillBoard', () => {
    // A 3x2 board: two blocks already on it (at 3 and 4), the rest empty
    const partBoard = () => boardWith({ 3: regular('red'), 4: plus1() }, 3, 2);

    it('fills every empty space with a regular block, keeps the blocks already there, and lists the spaces filled', () => {
        const { board, added } = refillBoard(partBoard());
        expect(added).toEqual([0, 1, 2, 5]);
        expect(board.blocks[3]).toEqual(regular('red'));
        expect(board.blocks[4]).toEqual(plus1());
        for (const index of added) {
            expect(BLOCK_COLORS).toContain(board.blocks[index].color);
        }
    });

    it('puts the special blocks it is given in some of the new spaces', () => {
        const { board, added } = refillBoard(partBoard(), ['bomb', 'lineVertical']);
        const newSpecials = added.map((index) => board.blocks[index].special).filter((s) => s !== undefined);
        expect(newSpecials.sort()).toEqual(['bomb', 'lineVertical']);
    });

    it('does not change the board it is given', () => {
        const before = partBoard();
        refillBoard(before);
        expect(before.blocks[0]).toEqual({ color: null });
    });
});
