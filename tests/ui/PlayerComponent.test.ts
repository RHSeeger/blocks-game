import { renderPlayerArea } from '../../src/typescript/ui/PlayerComponent';
import { makeGameState } from '../helpers/testBoards';

/**
 * Tests for drawing a player's area: scores, the board, the finished-board display, and the Next Board button.
 */

describe('renderPlayerArea', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <span id="human-score"></span><span id="human-board-score"></span>
            <span id="human-board-number"></span><span id="human-max-board-score"></span>
            <div id="human-board"></div>
            <button id="next-board-btn" hidden></button>`;
    });

    it('shows the scores', () => {
        const { humanPlayer } = makeGameState();
        humanPlayer.totalScore = 120;
        humanPlayer.boardScore = 30;
        humanPlayer.boardNumber = 4;
        humanPlayer.maxBoardScore = 75;

        renderPlayerArea('human', humanPlayer, false);

        expect(document.getElementById('human-score')?.textContent).toBe('120');
        expect(document.getElementById('human-board-score')?.textContent).toBe('30');
        expect(document.getElementById('human-board-number')?.textContent).toBe('4');
        expect(document.getElementById('human-max-board-score')?.textContent).toBe('75');
    });

    it('dims the board and shows the Next Board button when the board is finished', () => {
        renderPlayerArea('human', makeGameState().humanPlayer, true);
        expect(document.getElementById('human-board')?.classList.contains('inactive')).toBe(true);
        expect(document.getElementById('next-board-btn')?.hidden).toBe(false);
    });

    it('hides the Next Board button while the board is not finished', () => {
        renderPlayerArea('human', makeGameState().humanPlayer, true);
        renderPlayerArea('human', makeGameState().humanPlayer, false);
        expect(document.getElementById('human-board')?.classList.contains('inactive')).toBe(false);
        expect(document.getElementById('next-board-btn')?.hidden).toBe(true);
    });
});
