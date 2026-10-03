import { grantAchievement } from '../../../src/typescript/gamelogic/actions/grantAchievement';
import { grantCurrency } from '../../../src/typescript/gamelogic/actions/grantCurrency';
import { getGameState, setGameState } from '../../../src/typescript/gamelogic/gameStateStore';
import { gameStateChanged } from '../../../src/typescript/bridge/logicToUi';
import { ACHIEVEMENT_GEMS, EVERY_COLOR_LEFT } from '../../../src/typescript/data/achievements';
import { BOMB_BLOCK } from '../../../src/typescript/data/augmentations';
import { makeGameState } from '../../helpers/testBoards';

/**
 * Tests for the debug tools' entry points: granting an achievement, and adding currency. The bridge is mocked (see
 * design/code-design.md, "Bridge System").
 */

jest.mock('../../../src/typescript/bridge/logicToUi');

describe('grantAchievement', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.mocked(gameStateChanged).mockClear();
        setGameState(makeGameState());
    });

    it('awards the achievement as if it had been accomplished: its Gems, its unlock, and the notifications', () => {
        grantAchievement(EVERY_COLOR_LEFT);
        const gameState = getGameState();
        expect(gameState.accomplishedAchievements).toEqual([EVERY_COLOR_LEFT]);
        expect(gameState.wallet.gems).toBe(ACHIEVEMENT_GEMS);
        expect(gameState.humanPlayer.augmentations).toEqual([BOMB_BLOCK]);
        expect(jest.mocked(gameStateChanged).mock.calls[0][2]).toEqual([
            { kind: 'achievement', achievement: EVERY_COLOR_LEFT },
            { kind: 'augmentation', augmentation: BOMB_BLOCK, player: 'human' },
        ]);
    });

    it('does nothing for an achievement already accomplished, or one that does not exist', () => {
        grantAchievement(EVERY_COLOR_LEFT);
        jest.mocked(gameStateChanged).mockClear();
        grantAchievement(EVERY_COLOR_LEFT);
        grantAchievement('no_such_achievement');
        expect(getGameState().wallet.gems).toBe(ACHIEVEMENT_GEMS);
        expect(getGameState().accomplishedAchievements).toEqual([EVERY_COLOR_LEFT]);
        expect(gameStateChanged).not.toHaveBeenCalled();
    });
});

describe('grantCurrency', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.mocked(gameStateChanged).mockClear();
        setGameState(makeGameState());
    });

    it('adds the amount to the wallet, and sends the state to the UI', () => {
        grantCurrency('chips', 1000);
        grantCurrency('gems', 10);
        expect(getGameState().wallet).toEqual({ coins: 0, chips: 1000, gems: 10 });
        expect(gameStateChanged).toHaveBeenCalledTimes(2);
    });

    it.each([0, -5, 1.5, NaN])('ignores an amount of %p', (amount) => {
        grantCurrency('coins', amount);
        expect(getGameState().wallet.coins).toBe(0);
        expect(gameStateChanged).not.toHaveBeenCalled();
    });
});
