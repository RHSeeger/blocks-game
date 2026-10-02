import {
    buyUpgradeLevel,
    getBoardSize,
    getComputerTurnMs,
    getGreedyGroupsChecked,
    getPlus1Chance,
    getUpgradeCost,
    getUpgradeCurrency,
    getUpgradeOffers,
    rollPlus1Count,
} from '../../src/typescript/gamelogic/upgrades';
import { createNewBoard } from '../../src/typescript/gamelogic/createNewBoard';
import { GREEDY, PLUS1_BLOCK } from '../../src/typescript/data/augmentations';
import {
    ALL_UPGRADES,
    BOARD_SIZE,
    COMPUTER_SPEED,
    GREEDY_GROUPS,
    PLUS1_CHANCE,
} from '../../src/typescript/data/upgrades';
import type { Upgrade } from '../../src/typescript/types/Upgrade';
import { makeGameState } from '../helpers/testBoards';

/**
 * Tests for Upgrades: costs, currencies, buying, and what each level does.
 */

const definition = (internalName: string): Upgrade => ALL_UPGRADES.find((u) => u.internalName === internalName)!;

const offerFor = (gameState: ReturnType<typeof makeGameState>, upgrade: string, player: 'human' | 'computer') =>
    getUpgradeOffers(gameState).find((offer) => offer.upgrade === upgrade && offer.player === player)!;

describe('getUpgradeCurrency', () => {
    it('charges Chips for everyday Upgrades for the human, and Coins for the computer', () => {
        expect(getUpgradeCurrency(definition(PLUS1_CHANCE), 'human')).toBe('chips');
        expect(getUpgradeCurrency(definition(PLUS1_CHANCE), 'computer')).toBe('coins');
    });

    it('charges Gems for game-changing Upgrades, for either player', () => {
        expect(getUpgradeCurrency(definition(BOARD_SIZE), 'human')).toBe('gems');
        expect(getUpgradeCurrency(definition(BOARD_SIZE), 'computer')).toBe('gems');
    });
});

describe('getUpgradeCost', () => {
    it('starts at the base cost and multiplies by the scaling for each level', () => {
        const upgrade: Upgrade = { ...definition(PLUS1_CHANCE), baseCost: 100, costScaling: 1.5 };
        expect(getUpgradeCost(upgrade, 0)).toBe(100);
        expect(getUpgradeCost(upgrade, 1)).toBe(150);
        expect(getUpgradeCost(upgrade, 2)).toBe(225);
    });
});

describe('buying Upgrades', () => {
    it('spends the currency and raises the level', () => {
        const gameState = makeGameState();
        gameState.wallet.coins = 1000;
        const cost = offerFor(gameState, COMPUTER_SPEED, 'computer').cost!;

        expect(buyUpgradeLevel(gameState, COMPUTER_SPEED, 'computer')).toBe(true);

        expect(gameState.wallet.coins).toBe(1000 - cost);
        expect(gameState.computerPlayer.upgradeLevels[COMPUTER_SPEED]).toBe(1);
        expect(offerFor(gameState, COMPUTER_SPEED, 'computer').cost).toBeGreaterThan(cost);
    });

    it('refuses when there is not enough currency', () => {
        const gameState = makeGameState();
        gameState.wallet.coins = 1;
        expect(offerFor(gameState, COMPUTER_SPEED, 'computer').canBuy).toBe(false);
        expect(buyUpgradeLevel(gameState, COMPUTER_SPEED, 'computer')).toBe(false);
        expect(gameState.wallet.coins).toBe(1);
    });

    it('refuses until the required Augmentation is unlocked for that player', () => {
        const gameState = makeGameState();
        gameState.wallet.chips = 1000;
        expect(offerFor(gameState, PLUS1_CHANCE, 'human').requires).toBe('+1 Blocks');
        expect(buyUpgradeLevel(gameState, PLUS1_CHANCE, 'human')).toBe(false);

        gameState.humanPlayer.augmentations = [PLUS1_BLOCK];
        expect(offerFor(gameState, PLUS1_CHANCE, 'human').requires).toBeUndefined();
        expect(buyUpgradeLevel(gameState, PLUS1_CHANCE, 'human')).toBe(true);
    });

    it('refuses at the highest level', () => {
        const gameState = makeGameState();
        gameState.wallet.gems = 1000;
        gameState.humanPlayer.upgradeLevels[BOARD_SIZE] = definition(BOARD_SIZE).maxLevel!;
        expect(offerFor(gameState, BOARD_SIZE, 'human').cost).toBeUndefined();
        expect(buyUpgradeLevel(gameState, BOARD_SIZE, 'human')).toBe(false);
    });

    it('refuses an Upgrade for a player it is not for, or one that does not exist', () => {
        const gameState = makeGameState();
        gameState.wallet = { coins: 1000, chips: 1000, gems: 1000 };
        expect(buyUpgradeLevel(gameState, COMPUTER_SPEED, 'human')).toBe(false);
        expect(buyUpgradeLevel(gameState, 'noSuchUpgrade', 'human')).toBe(false);
    });

    it('offers each Upgrade only for the players it is for', () => {
        const offers = getUpgradeOffers(makeGameState());
        expect(offers.filter((offer) => offer.upgrade === COMPUTER_SPEED).map((offer) => offer.player)).toEqual([
            'computer',
        ]);
        expect(offers.filter((offer) => offer.upgrade === BOARD_SIZE).map((offer) => offer.player)).toEqual([
            'human',
            'computer',
        ]);
    });
});

describe('+1 Block Chance', () => {
    it('is 0 without +1 Blocks, 100% once unlocked, and goes up 25% per level', () => {
        const { humanPlayer } = makeGameState();
        expect(getPlus1Chance(humanPlayer)).toBe(0);
        humanPlayer.augmentations = [PLUS1_BLOCK];
        expect(getPlus1Chance(humanPlayer)).toBe(100);
        humanPlayer.upgradeLevels[PLUS1_CHANCE] = 2;
        expect(getPlus1Chance(humanPlayer)).toBe(150);
    });

    it.each([
        [0, 0.0, 0],
        [100, 0.99, 1],
        [150, 0.49, 2], // one for sure, plus a 50% chance of a second: the random number is under 50%
        [150, 0.5, 1], // ... and here it isn't
        [275, 0.7, 3],
        [275, 0.8, 2],
    ])('with a %i%% chance and a random number of %f, places %i +1 blocks', (chance, random, expected) => {
        expect(rollPlus1Count(chance, random)).toBe(expected);
    });

    it('puts the rolled number of +1 blocks on a new board', () => {
        const { humanPlayer } = makeGameState();
        humanPlayer.augmentations = [PLUS1_BLOCK];
        humanPlayer.upgradeLevels[PLUS1_CHANCE] = 4; // 200%: always exactly two
        const board = createNewBoard(humanPlayer);
        expect(board.blocks.filter((block) => block.special === 'plus1')).toHaveLength(2);
    });
});

describe('the other Upgrades', () => {
    it('Greedier raises the number of groups Greedy checks, until it checks every group', () => {
        const { computerPlayer } = makeGameState();
        computerPlayer.augmentations = [GREEDY];
        expect(getGreedyGroupsChecked(computerPlayer)).toBe(3);
        computerPlayer.upgradeLevels[GREEDY_GROUPS] = 1;
        expect(getGreedyGroupsChecked(computerPlayer)).toBe(5);
        computerPlayer.upgradeLevels[GREEDY_GROUPS] = definition(GREEDY_GROUPS).maxLevel!;
        expect(getGreedyGroupsChecked(computerPlayer)).toBe(Infinity);
    });

    it('Faster Computer shortens the time between computer turns', () => {
        const { computerPlayer } = makeGameState();
        expect(getComputerTurnMs(computerPlayer)).toBe(1000);
        computerPlayer.upgradeLevels[COMPUTER_SPEED] = 2;
        expect(getComputerTurnMs(computerPlayer)).toBeCloseTo(640);
    });

    it('Bigger Board makes the next board bigger', () => {
        const { humanPlayer } = makeGameState();
        expect(getBoardSize(humanPlayer)).toEqual({ width: 10, height: 10 });
        humanPlayer.upgradeLevels[BOARD_SIZE] = 2;
        expect(getBoardSize(humanPlayer)).toEqual({ width: 12, height: 12 });
        const board = createNewBoard(humanPlayer);
        expect(board.width).toBe(12);
        expect(board.blocks).toHaveLength(144);
    });
});
