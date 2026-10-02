import { renderBoard } from '../../src/typescript/ui/BoardComponent';
import { boardWithFirstRow, makeGameState, plus1, regular } from '../helpers/testBoards';

/**
 * Tests for drawing a board.
 */

describe('renderBoard', () => {
    let boardElement: HTMLElement;

    beforeEach(() => {
        boardElement = document.createElement('div');
    });

    it('draws one element per space, marking regular, special, empty and selected blocks', () => {
        const { humanPlayer } = makeGameState(boardWithFirstRow([regular('red'), regular('red'), plus1()]));
        humanPlayer.selectedIndices = [0, 1, 2];

        renderBoard(boardElement, humanPlayer);

        const elements = Array.from(boardElement.children) as HTMLElement[];
        expect(elements).toHaveLength(100);
        expect(elements[0].style.getPropertyValue('--block-color')).toBe('red');
        expect(elements[0].dataset.index).toBe('0');
        expect(elements[0].classList.contains('selected')).toBe(true);
        expect(elements[2].classList.contains('special')).toBe(true);
        expect(elements[2].textContent).toBe('+1');
        expect(elements[3].classList.contains('empty')).toBe(true);
        expect(elements[3].classList.contains('selected')).toBe(false);
    });

    it('updates the existing elements in place when drawn again, so clicks are not lost', () => {
        const gameState = makeGameState(boardWithFirstRow([regular('red'), regular('red')]));
        renderBoard(boardElement, gameState.humanPlayer);
        const firstElement = boardElement.children[0];

        gameState.humanPlayer.board.blocks[0] = { color: null };
        renderBoard(boardElement, gameState.humanPlayer);

        expect(boardElement.children[0]).toBe(firstElement);
        expect(firstElement.classList.contains('empty')).toBe(true);
        expect((firstElement as HTMLElement).style.getPropertyValue('--block-color')).toBe('');
    });
});
