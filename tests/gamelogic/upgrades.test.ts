import {
    buyUpgradeLevel,
    getBoardSize,
    getComputerTurnMs,
    getGreedyGroupsChecked,
    getSpecialBlockChance,
    getUpgradeCost,
    getUpgradeCurrency,
    getUpgradeMaxLevel,
    getUpgradeOffers,
    rollSpecialBlockCount,
} from '../../src/typescript/gamelogic/upgrades';
import { createNewBoard } from '../../src/typescript/gamelogic/createNewBoard';
import { BOMB_BLOCK, GREEDY, LINE_BLOCK, PLUS1_BLOCK } from '../../src/typescript/data/augmentations';
import { SPECIAL_BLOCK_SPAWNS } from '../../src/typescript/data/specialBlocks';
import {
    ALL_UPGRADES,
    BOARD_SIZE,
    BOMB_CHANCE,
    COMPUTER_SPEED,
    GREEDY_GROUPS,
    LINE_CHANCE,
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
        gameState.computerPlayer.upgradeLevels[COMPUTER_SPEED] = definition(COMPUTER_SPEED).maxLevel!;
        expect(offerFor(gameState, COMPUTER_SPEED, 'computer').cost).toBeUndefined();
        expect(buyUpgradeLevel(gameState, COMPUTER_SPEED, 'computer')).toBe(false);
    });

    it('can have a different highest level for each player', () => {
        const gameState = makeGameState();
        gameState.wallet.gems = 100000;
        const humanMax = getUpgradeMaxLevel(definition(BOARD_SIZE), 'human')!;
        gameState.humanPlayer.upgradeLevels[BOARD_SIZE] = humanMax;
        gameState.computerPlayer.upgradeLevels[BOARD_SIZE] = humanMax;
        expect(buyUpgradeLevel(gameState, BOARD_SIZE, 'human')).toBe(false);
        expect(buyUpgradeLevel(gameState, BOARD_SIZE, 'computer')).toBe(true);
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

describe('special block chances (+1 Block Chance, Line Block Chance)', () => {
    const spawnFor = (augmentation: string) => SPECIAL_BLOCK_SPAWNS.find((s) => s.augmentation === augmentation)!;

    it.each([
        [PLUS1_BLOCK, PLUS1_CHANCE],
        [LINE_BLOCK, LINE_CHANCE],
        [BOMB_BLOCK, BOMB_CHANCE],
    ])('%s: 0 until unlocked, 100% once unlocked, and up 25% for each level of %s', (augmentation, upgrade) => {
        const { humanPlayer } = makeGameState();
        const spawn = spawnFor(augmentation);
        expect(getSpecialBlockChance(humanPlayer, spawn)).toBe(0);
        humanPlayer.augmentations = [augmentation];
        expect(getSpecialBlockChance(humanPlayer, spawn)).toBe(100);
        humanPlayer.upgradeLevels[upgrade] = 2;
        expect(getSpecialBlockChance(humanPlayer, spawn)).toBe(150);
    });

    it.each([
        [0, 0.0, 0],
        [100, 0.99, 1],
        [150, 0.49, 2], // one for sure, plus a 50% chance of a second: the random number is under 50%
        [150, 0.5, 1], // ... and here it isn't
        [275, 0.7, 3],
        [275, 0.8, 2],
    ])('with a %i%% chance and a random number of %f, places %i special blocks', (chance, random, expected) => {
        expect(rollSpecialBlockCount(chance, random)).toBe(expected);
    });

    it('puts the rolled number of +1 blocks on a new board', () => {
        const { humanPlayer } = makeGameState();
        humanPlayer.augmentations = [PLUS1_BLOCK];
        humanPlayer.upgradeLevels[PLUS1_CHANCE] = 4; // 200%: always exactly two
        const board = createNewBoard(humanPlayer, 'human');
        expect(board.blocks.filter((block) => block.special === 'plus1')).toHaveLength(2);
    });

    it('puts line blocks on a new board alongside +1 blocks, each horizontal or vertical', () => {
        const { humanPlayer } = makeGameState();
        humanPlayer.augmentations = [PLUS1_BLOCK, LINE_BLOCK];
        humanPlayer.upgradeLevels[LINE_CHANCE] = 8; // 300%: always exactly three
        const { blocks } = createNewBoard(humanPlayer, 'human');
        const lines = blocks.filter((b) => b.special === 'lineHorizontal' || b.special === 'lineVertical');
        expect(lines).toHaveLength(3);
        expect(blocks.filter((block) => block.special === 'plus1')).toHaveLength(1);
    });

    it("describes the chance as the Upgrade's effect", () => {
        const gameState = makeGameState();
        gameState.computerPlayer.augmentations = [LINE_BLOCK];
        gameState.computerPlayer.upgradeLevels[LINE_CHANCE] = 1;
        expect(offerFor(gameState, LINE_CHANCE, 'computer').effect).toBe('125% chance per board');
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

    it("Bigger Board makes the next board bigger, from each player's starting size", () => {
        const { humanPlayer, computerPlayer } = makeGameState();
        expect(getBoardSize(humanPlayer, 'human')).toEqual({ width: 8, height: 8 });
        expect(getBoardSize(computerPlayer, 'computer')).toEqual({ width: 10, height: 10 });
        humanPlayer.upgradeLevels[BOARD_SIZE] = 2;
        expect(getBoardSize(humanPlayer, 'human')).toEqual({ width: 10, height: 10 });
        const board = createNewBoard(humanPlayer, 'human');
        expect(board.width).toBe(10);
        expect(board.blocks).toHaveLength(100);
    });

    it("Bigger Board stops at each player's largest size: 12x12 for the human, 20x20 for the computer", () => {
        const { humanPlayer, computerPlayer } = makeGameState();
        const human = getUpgradeMaxLevel(definition(BOARD_SIZE), 'human')!;
        const computer = getUpgradeMaxLevel(definition(BOARD_SIZE), 'computer')!;
        humanPlayer.upgradeLevels[BOARD_SIZE] = human;
        computerPlayer.upgradeLevels[BOARD_SIZE] = computer;
        expect(getBoardSize(humanPlayer, 'human')).toEqual({ width: 12, height: 12 });
        expect(getBoardSize(computerPlayer, 'computer')).toEqual({ width: 20, height: 20 });

        // A save from before the sizes changed could have more levels than are now allowed
        humanPlayer.upgradeLevels[BOARD_SIZE] = human + 1;
        expect(getBoardSize(humanPlayer, 'human')).toEqual({ width: 12, height: 12 });
    });
});
