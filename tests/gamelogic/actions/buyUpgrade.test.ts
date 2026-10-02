import { buyUpgrade } from '../../../src/typescript/gamelogic/actions/buyUpgrade';
import { setGameState } from '../../../src/typescript/gamelogic/gameStateStore';
import { loadGameState } from '../../../src/typescript/gamelogic/persistence';
import { gameStateChanged } from '../../../src/typescript/bridge/logicToUi';
import { COMPUTER_SPEED } from '../../../src/typescript/data/upgrades';
import { makeGameState } from '../../helpers/testBoards';

/**
 * Tests for the buyUpgrade entry point. The bridge is mocked, so these tests don't need the UI.
 */

jest.mock('../../../src/typescript/bridge/logicToUi');

describe('buyUpgrade', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.mocked(gameStateChanged).mockClear();
    });

    it('buys the Upgrade, saves, and sends the new state to the UI', () => {
        const gameState = makeGameState();
        gameState.wallet.coins = 1000;
        setGameState(gameState);

        buyUpgrade(COMPUTER_SPEED, 'computer');

        expect(gameState.computerPlayer.upgradeLevels[COMPUTER_SPEED]).toBe(1);
        expect(loadGameState()).toEqual(gameState);
        expect(gameStateChanged).toHaveBeenCalledTimes(1);
    });

    it('does nothing when the Upgrade cannot be bought', () => {
        setGameState(makeGameState());
        buyUpgrade(COMPUTER_SPEED, 'computer');
        expect(gameStateChanged).not.toHaveBeenCalled();
        expect(loadGameState()).toBeNull();
    });
});
