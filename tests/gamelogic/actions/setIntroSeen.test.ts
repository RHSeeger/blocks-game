import { setIntroSeen } from '../../../src/typescript/gamelogic/actions/setIntroSeen';
import { getGameState, setGameState } from '../../../src/typescript/gamelogic/gameStateStore';
import { loadGameState } from '../../../src/typescript/gamelogic/persistence';
import { gameStateChanged } from '../../../src/typescript/bridge/logicToUi';
import { makeGameState } from '../../helpers/testBoards';

/**
 * Tests for the setIntroSeen entry point: closing the introduction pop-up, and asking to see it again. The bridge is
 * mocked (see design/code-design.md, "Bridge System").
 */

jest.mock('../../../src/typescript/bridge/logicToUi');

describe('setIntroSeen', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.mocked(gameStateChanged).mockClear();
        setGameState({ ...makeGameState(), introSeen: false });
    });

    it('records that the introduction was seen, saves it, and sends the state to the UI', () => {
        setIntroSeen(true);
        expect(getGameState().introSeen).toBe(true);
        expect(loadGameState()?.introSeen).toBe(true);
        expect(gameStateChanged).toHaveBeenCalledTimes(1);
    });

    it('can be set back to not seen, to show it again', () => {
        setIntroSeen(true);
        setIntroSeen(false);
        expect(getGameState().introSeen).toBe(false);
    });

    it('does nothing if it is already set that way', () => {
        setIntroSeen(false);
        expect(gameStateChanged).not.toHaveBeenCalled();
    });
});
