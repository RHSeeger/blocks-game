import { renderSpecialBlockPopup, setUpSpecialBlockPopup } from '../../src/typescript/ui/SpecialBlockPopupComponent';
import { createMiniBoard } from '../../src/typescript/ui/MiniBoard';
import { SPECIAL_BLOCK_EXPLANATIONS } from '../../src/typescript/ui/specialBlockExplanations';
import { onSpecialBlockExplanationClosed } from '../../src/typescript/bridge/uiToLogic';
import { LINE_BLOCK, PLUS1_BLOCK } from '../../src/typescript/data/augmentations';
import { SPECIAL_BLOCK_SPAWNS } from '../../src/typescript/data/specialBlocks';

/**
 * Tests for the pop-up explaining a newly unlocked special block, and the example boards in it. The bridge is mocked.
 */

jest.mock('../../src/typescript/bridge/uiToLogic');

const popup = () => document.getElementById('special-block-popup') as HTMLElement;

describe('special block pop-up', () => {
    beforeAll(() => {
        // The listeners are added once, as at startup
        document.body.innerHTML = `
            <div id="special-block-popup" hidden>
                <h2 id="special-block-title"></h2>
                <div id="special-block-pictures"></div>
                <div id="special-block-text"></div>
                <button id="special-block-close">Got it!</button>
            </div>`;
        setUpSpecialBlockPopup();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        renderSpecialBlockPopup(undefined);
    });

    it('has an explanation for every kind of special block', () => {
        for (const spawn of SPECIAL_BLOCK_SPAWNS) {
            expect(SPECIAL_BLOCK_EXPLANATIONS[spawn.augmentation]).toBeDefined();
        }
    });

    it('shows the explanation of the special block given, with its title, pictures and text', () => {
        renderSpecialBlockPopup(LINE_BLOCK);
        expect(popup().hidden).toBe(false);
        expect(document.getElementById('special-block-title')?.textContent).toBe('New: Line Blocks');
        expect(document.querySelectorAll('#special-block-pictures .mini-board')).toHaveLength(1);
        expect(document.getElementById('special-block-text')?.textContent).toContain('every block in its row');
    });

    it('is hidden when there is nothing to explain', () => {
        renderSpecialBlockPopup(PLUS1_BLOCK);
        renderSpecialBlockPopup(undefined);
        expect(popup().hidden).toBe(true);
    });

    it('reports which special block was explained when it is closed, by its button or by Escape', () => {
        renderSpecialBlockPopup(PLUS1_BLOCK);
        (document.getElementById('special-block-close') as HTMLElement).click();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(onSpecialBlockExplanationClosed).toHaveBeenCalledTimes(2);
        expect(onSpecialBlockExplanationClosed).toHaveBeenCalledWith(PLUS1_BLOCK);
    });
});

describe('createMiniBoard', () => {
    it('builds a block for each cell: colors, special blocks, empty spaces, and selected ones', () => {
        const board = createMiniBoard(['R! +1', '. H']);
        const cells = [...board.children] as HTMLElement[];
        expect(board.style.getPropertyValue('--cols')).toBe('2');
        expect(cells).toHaveLength(4);
        expect(cells[0].dataset.color).toBe('red');
        expect(cells[0].classList.contains('selected')).toBe(true);
        expect(cells[1].dataset.special).toBe('plus1');
        expect(cells[1].textContent).toBe('+1');
        expect(cells[2].classList.contains('empty')).toBe(true);
        expect(cells[3].dataset.special).toBe('lineHorizontal');
        expect(cells[3].classList.contains('selected')).toBe(false);
    });
});
