import { getCleanupBonus, getCleanupBonusPercent } from '../../../src/typescript/gamelogic/board/cleanupBonus';
import { boardWith, plus1, regular } from '../../helpers/testBoards';

/**
 * Tests for the clean-up bonus: how much a board that ends with few blocks left is worth.
 */

describe('getCleanupBonusPercent', () => {
    it.each([
        [6, 0], // more blocks left than there are colors: no bonus
        [5, 5],
        [4, 10],
        [3, 15],
        [2, 20],
        [1, 25],
        [0, 50], // 30%, plus 20% for clearing the board completely
    ])('with 5 colors, %i blocks left is +%i%', (blocksLeft, percent) => {
        expect(getCleanupBonusPercent(blocksLeft, 5)).toBe(percent);
    });

    it('starts at more blocks left, and is worth more, with more colors', () => {
        expect(getCleanupBonusPercent(6, 6)).toBe(5);
        expect(getCleanupBonusPercent(0, 6)).toBe(55);
    });
});

describe('getCleanupBonus', () => {
    it('counts every block left, special blocks too, and works out the points from the board score', () => {
        const board = boardWith({ 0: regular('red'), 1: plus1(), 2: regular('blue') });
        expect(getCleanupBonus(board, 200)).toEqual({ blocksLeft: 3, percent: 15, points: 30 });
    });

    it('is no points when there are too many blocks left', () => {
        const board = boardWith(Object.fromEntries([0, 1, 2, 3, 4, 5].map((i) => [i, regular('red')])));
        expect(getCleanupBonus(board, 200).points).toBe(0);
    });
});
