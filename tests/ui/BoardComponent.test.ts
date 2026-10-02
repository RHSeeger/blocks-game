import { renderBoard } from '../../src/typescript/ui/BoardComponent';
import { boardWith, boardWithFirstRow, makeGameState, plus1, regular } from '../helpers/testBoards';

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
        expect(elements[0].dataset.color).toBe('red');
        expect(elements[2].dataset.color).toBeUndefined();
        expect(elements[0].dataset.index).toBe('0');
        expect(elements[0].classList.contains('selected')).toBe(true);
        expect(elements[2].classList.contains('special')).toBe(true);
        expect(elements[2].textContent).toBe('+1');
        expect(elements[3].classList.contains('empty')).toBe(true);
        expect(elements[3].classList.contains('selected')).toBe(false);
    });

    it("sizes the grid from the board's width and height", () => {
        const { humanPlayer } = makeGameState(boardWith({}, 6, 4));
        renderBoard(boardElement, humanPlayer);
        expect(boardElement.children).toHaveLength(24);
        expect(boardElement.style.getPropertyValue('--board-columns')).toBe('6');
        expect(boardElement.style.getPropertyValue('--board-rows')).toBe('4');
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
        expect((firstElement as HTMLElement).dataset.color).toBeUndefined();
    });
});
