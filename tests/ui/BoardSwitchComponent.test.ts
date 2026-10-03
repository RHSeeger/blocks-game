import { setUpBoardSwitch, showBoard } from '../../src/typescript/ui/BoardSwitchComponent';

/**
 * Tests for the "You | Computer" switch: picking a board marks it on the boards' wrapper (which the phone layout uses
 * to show only that board) and on the buttons.
 */

const wrapper = () => document.getElementById('boards-wrapper') as HTMLElement;
const button = (player: string) =>
    document.querySelector(`.board-switch-button[data-player="${player}"]`) as HTMLElement;

describe('board switch', () => {
    beforeAll(() => {
        document.body.innerHTML = `
            <div class="board-switch">
                <button class="board-switch-button active" data-player="human" aria-pressed="true">You</button>
                <button class="board-switch-button" data-player="computer" aria-pressed="false">Computer</button>
            </div>
            <div id="boards-wrapper" data-showing="human"></div>`;
        setUpBoardSwitch();
    });

    beforeEach(() => showBoard('human'));

    it("shows the computer's board when its button is clicked", () => {
        button('computer').click();
        expect(wrapper().dataset.showing).toBe('computer');
        expect(button('computer').classList.contains('active')).toBe(true);
        expect(button('computer').getAttribute('aria-pressed')).toBe('true');
        expect(button('human').classList.contains('active')).toBe(false);
        expect(button('human').getAttribute('aria-pressed')).toBe('false');
    });

    it("switches back to the human player's board", () => {
        button('computer').click();
        button('human').click();
        expect(wrapper().dataset.showing).toBe('human');
        expect(button('human').classList.contains('active')).toBe(true);
    });
});
