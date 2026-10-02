import { blockClicked } from '../../../src/typescript/gamelogic/actions/blockClicked';
import { setGameState } from '../../../src/typescript/gamelogic/gameStateStore';
import { loadGameState } from '../../../src/typescript/gamelogic/persistence';
import { gameStateChanged } from '../../../src/typescript/bridge/logicToUi';
import { boardWithFirstRow, makeGameState, regular } from '../../helpers/testBoards';

/**
 * Tests for the blockClicked entry point: it changes the state, saves it, and sends it to the UI through the bridge.
 * The bridge is mocked, so these tests don't need the UI or the page (see design/code-design.md, "Bridge System").
 */

jest.mock('../../../src/typescript/bridge/logicToUi');

describe('blockClicked', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.mocked(gameStateChanged).mockClear();
    });

    it('updates the game state in the store, saves it, and sends it to the UI', () => {
        const gameState = makeGameState(boardWithFirstRow([regular('red'), regular('red'), regular('blue')]));
        setGameState(gameState);

        blockClicked(0);

        expect(gameState.humanPlayer.selectedIndices).toHaveLength(2);
        expect(loadGameState()).toEqual(gameState);
        expect(gameStateChanged).toHaveBeenCalledTimes(1);
        expect(gameStateChanged).toHaveBeenCalledWith(gameState, {
            boardFinished: { human: false, computer: true },
        });
    });

    it('reports the board as finished once the last group is removed', () => {
        setGameState(makeGameState(boardWithFirstRow([regular('red'), regular('red'), regular('blue')])));

        blockClicked(0);
        blockClicked(0);

        expect(jest.mocked(gameStateChanged).mock.calls[1][1]).toEqual({
            boardFinished: { human: true, computer: true },
        });
    });
});
