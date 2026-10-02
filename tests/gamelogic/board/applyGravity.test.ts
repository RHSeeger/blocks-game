import { applyGravity } from '../../../src/typescript/gamelogic/board/applyGravity';
import { boardWith, boardWithFirstRow, plus1, regular, rowColors } from '../../helpers/testBoards';

/**
 * Tests for settling a board after blocks are removed.
 */

describe('applyGravity', () => {
    it('drops blocks down to fill gaps in each column', () => {
        const blocks = applyGravity(boardWith({ 0: regular('red'), 20: regular('blue'), 40: regular('green') }));
        expect(blocks[90].color).toBe('green');
        expect(blocks[80].color).toBe('blue');
        expect(blocks[70].color).toBe('red');
        for (let row = 0; row < 7; row++) {
            expect(blocks[row * 10].color).toBeNull();
        }
    });

    it('moves special blocks like any other block', () => {
        const blocks = applyGravity(boardWith({ 0: plus1(), 10: regular('blue') }));
        expect(blocks[80].special).toBe('plus1');
        expect(blocks[90].color).toBe('blue');
        expect(blocks[0]).toEqual({ color: null });
    });

    it('changes nothing when every block is already settled', () => {
        const before = boardWith({ 90: regular('red'), 80: regular('blue'), 70: regular('green') });
        expect(applyGravity(before)).toEqual(before);
    });

    it('slides blocks left to fill gaps in a row', () => {
        const blocks = applyGravity(boardWith({ 90: regular('red'), 92: regular('blue') }));
        expect(rowColors(blocks, 9).slice(0, 3)).toEqual(['red', 'blue', null]);
    });

    it('drops, then slides left', () => {
        const blocks = applyGravity(boardWith({ 80: regular('red'), 92: regular('blue') }));
        expect(rowColors(blocks, 9).slice(0, 3)).toEqual(['red', 'blue', null]);
        expect(blocks[80].color).toBeNull();
    });

    it('slides across several empty columns', () => {
        const blocks = applyGravity(boardWith({ 92: regular('green') }));
        expect(rowColors(blocks, 9).slice(0, 3)).toEqual(['green', null, null]);
    });

    it('keeps blocks in order when sliding left', () => {
        const blocks = applyGravity(
            boardWithFirstRow([
                regular('blue'),
                { color: null },
                regular('green'),
                { color: null },
                regular('yellow'),
                regular('green'),
            ]),
        );
        expect(rowColors(blocks, 9)).toEqual(['blue', 'green', 'yellow', 'green', null, null, null, null, null, null]);
    });

    it('does not change the array it is given', () => {
        const before = boardWith({ 0: regular('red') });
        applyGravity(before);
        expect(before[0].color).toBe('red');
    });
});
