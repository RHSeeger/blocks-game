import { startMoveAnimations } from '../../src/typescript/ui/BoardAnimations';
import type { GameNotification } from '../../src/typescript/types/GameNotification';

/**
 * Tests for showing a move on the board. jsdom doesn't lay pages out or run animations, so these tests stand in for
 * the browser: they say the board is on screen, and record the animations started instead of running them.
 */

/** A 2x2 board: red, red on top, blue below the first. The move removes 0 and 1, and blue (2) doesn't move */
const move: GameNotification = {
    kind: 'blocksRemoved',
    player: 'human',
    clicked: 0,
    removed: [0, 1],
    score: 3,
    cameFrom: [-1, -1, 2, -1],
    added: [],
};

/** Returns the board's frame, where the animations are drawn */
const frame = () => document.querySelector('.board-frame') as HTMLElement;

describe('startMoveAnimations', () => {
    let animate: jest.Mock;

    beforeEach(() => {
        document.body.innerHTML = `
            <div class="board-frame">
                <div id="human-board" class="board">
                    <div class="block" data-index="0" data-color="red"></div>
                    <div class="block" data-index="1" data-color="red"></div>
                    <div class="block" data-index="2" data-color="blue"></div>
                    <div class="block empty" data-index="3"></div>
                </div>
            </div>`;
        animate = jest.fn(() => ({ onfinish: null }));
        HTMLElement.prototype.animate = animate;
        jest.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([{}] as unknown as DOMRectList);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        delete (HTMLElement.prototype as Partial<HTMLElement>).animate;
    });

    it('does nothing for notifications that are not moves', () => {
        expect(startMoveAnimations([{ kind: 'achievement', achievement: 'x' }])).toEqual([]);
    });

    it('shrinks away a copy of each removed block, before the board is redrawn', () => {
        startMoveAnimations([move]);
        const ghosts = frame().querySelectorAll('.block-ghost');
        expect(ghosts).toHaveLength(2);
        expect([...ghosts].map((ghost) => (ghost as HTMLElement).dataset.color)).toEqual(['red', 'red']);
        // The copies are in the frame, not the board, so the board still has one element per space
        expect(document.getElementById('human-board')?.children).toHaveLength(4);
        expect(ghosts[0].hasAttribute('data-index')).toBe(false);
    });

    it('shows the score after the board is redrawn', () => {
        const [finish] = startMoveAnimations([move]);
        expect(frame().querySelector('.score-popup')).toBeNull();
        finish();
        expect(frame().querySelector('.score-popup')?.textContent).toBe('+3');
    });

    it('drops in the new blocks from a refill, after the board is redrawn', () => {
        const [finish] = startMoveAnimations([{ ...move, added: [0, 1, 3] } as GameNotification]);
        animate.mockClear(); // the removed blocks' copies
        finish();
        const cells = [...(document.getElementById('human-board')?.children ?? [])];
        const animated = animate.mock.contexts as unknown as Element[];
        expect([0, 1, 3].every((index) => animated.includes(cells[index]))).toBe(true);
    });

    it('shows a clean-up bonus over the board, after it is redrawn', () => {
        const [finish] = startMoveAnimations([
            { kind: 'cleanupBonus', player: 'human', blocksLeft: 0, percent: 50, points: 40 },
        ]);
        expect(frame().querySelector('.cleanup-bonus')).toBeNull();
        finish();
        expect(frame().querySelector('.cleanup-bonus')?.textContent).toBe('+40 clean-up bonus');
    });

    it('shows nothing for a board that is not on screen', () => {
        jest.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([] as unknown as DOMRectList);
        const [finish] = startMoveAnimations([move]);
        finish();
        expect(frame().querySelector('.block-ghost, .score-popup')).toBeNull();
        expect(animate).not.toHaveBeenCalled();
    });
});
