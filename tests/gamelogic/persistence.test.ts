import { loadGameState, saveGameState } from '../../src/typescript/gamelogic/persistence';
import { createInitialGameState } from '../../src/typescript/gamelogic/createInitialGameState';
import { generateBoard } from '../../src/typescript/gamelogic/board/generateBoard';
import {
    ACHIEVEMENT_GEMS,
    EVERY_COLOR_LEFT,
    FIRST_CLEAR,
    GROUP_20,
    SCORE_1000,
} from '../../src/typescript/data/achievements';
import { BOMB_BLOCK, GREEDY, LINE_BLOCK, PLUS1_BLOCK } from '../../src/typescript/data/augmentations';
import { GEM_GOAL_INCREASE, GEM_GOAL_STARTING_BOARD_SCORE } from '../../src/typescript/data/gems';

/**
 * Tests for saving and loading the game state.
 */

describe('persistence', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.spyOn(console, 'warn').mockImplementation(() => undefined);
        // The clock is stopped, so a new game and an upgraded older save (which gets the time it's loaded as the
        // computer's last turn) have the same time
        jest.useFakeTimers({ now: 1_000_000 });
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    it('upgrades a version 5 save: the computer last played when it is loaded (so no time away)', () => {
        const current = createInitialGameState();
        const version5: Record<string, unknown> = { ...current, computerLastTurnAt: undefined };
        localStorage.setItem('blocksGameState', JSON.stringify({ version: 5, gameState: version5 }));
        jest.setSystemTime(2_000_000);
        expect(loadGameState()?.computerLastTurnAt).toBe(2_000_000);
    });

    it('loads exactly what was saved', () => {
        const gameState = createInitialGameState();
        gameState.humanPlayer.totalScore = 1234;
        gameState.humanPlayer.selectedIndices = [3, 4];
        gameState.accomplishedAchievements = [FIRST_CLEAR];
        gameState.humanPlayer.augmentations = [PLUS1_BLOCK]; // what First Board Clear unlocks (see the next test)
        saveGameState(gameState);
        expect(loadGameState()).toEqual(gameState);
    });

    it('applies, on every load, the unlock of any achievement accomplished whose Augmentation the player is missing', () => {
        // E.g. Taste the Rainbow was accomplished before it unlocked Bomb Blocks
        const gameState = createInitialGameState();
        gameState.accomplishedAchievements = [EVERY_COLOR_LEFT];
        saveGameState(gameState);
        expect(loadGameState()?.humanPlayer.augmentations).toEqual([BOMB_BLOCK]);
    });

    it('returns null when nothing has been saved', () => {
        expect(loadGameState()).toBeNull();
    });

    it('ignores a save without a version (the format from before 2026-10-01)', () => {
        localStorage.setItem('blocksGameState', JSON.stringify({ humanPlayer: {}, computerPlayer: {} }));
        expect(loadGameState()).toBeNull();
    });

    it('ignores a save whose game state is missing fields', () => {
        const gameState: Record<string, unknown> = { ...createInitialGameState() };
        delete gameState.gameStats;
        localStorage.setItem('blocksGameState', JSON.stringify({ version: 3, gameState }));
        expect(loadGameState()).toBeNull();
    });

    it('upgrades a version 1 save (boards had no size) to 10x10 boards, keeping the progress', () => {
        const current = createInitialGameState();
        current.humanPlayer.totalScore = 500;
        // Every board in a version 1 save was 10x10 (a new game's human board is now smaller)
        current.humanPlayer.board = generateBoard(10, 10);
        current.computerPlayer.board = generateBoard(10, 10);
        const withoutSize = (board: { blocks: unknown[] }) => ({ blocks: board.blocks });
        const version1 = {
            ...current,
            humanPlayer: { ...current.humanPlayer, board: withoutSize(current.humanPlayer.board) },
            computerPlayer: { ...current.computerPlayer, board: withoutSize(current.computerPlayer.board) },
        };
        localStorage.setItem('blocksGameState', JSON.stringify({ version: 1, gameState: version1 }));
        expect(loadGameState()).toEqual(current);
    });

    it('upgrades a version 2 save: empty wallet (plus Gems for achievements already earned), no Upgrade levels', () => {
        const current = createInitialGameState();
        current.accomplishedAchievements = [FIRST_CLEAR, GROUP_20];
        // A copy of the current state, without the fields version 3 added
        const version2 = JSON.parse(JSON.stringify(current));
        delete version2.wallet;
        delete version2.gemGoalBoardScore;
        delete version2.humanPlayer.upgradeLevels;
        delete version2.computerPlayer.upgradeLevels;
        localStorage.setItem('blocksGameState', JSON.stringify({ version: 2, gameState: version2 }));

        // The achievements' unlocks are applied too (on every load), since this save doesn't have them
        const loaded = loadGameState();
        expect(loaded).toEqual({
            ...current,
            humanPlayer: { ...current.humanPlayer, augmentations: [PLUS1_BLOCK] },
            computerPlayer: { ...current.computerPlayer, augmentations: [GREEDY] },
            wallet: { coins: 0, chips: 0, gems: 2 * ACHIEVEMENT_GEMS },
        });
    });

    it('upgrades a version 4 save, and applies any unlock its achievements are missing', () => {
        const current = createInitialGameState();
        current.accomplishedAchievements = [FIRST_CLEAR, SCORE_1000];
        current.humanPlayer.augmentations = [PLUS1_BLOCK]; // from First Board Clear, before Score 1000! unlocked anything
        localStorage.setItem('blocksGameState', JSON.stringify({ version: 4, gameState: current }));

        const loaded = loadGameState();
        expect(loaded?.humanPlayer.augmentations).toEqual([PLUS1_BLOCK, LINE_BLOCK]);
        expect(loaded?.computerPlayer.augmentations).toEqual([]);
    });

    it.each([
        [175, GEM_GOAL_STARTING_BOARD_SCORE], // no goals reached yet: the new starting goal
        [175 + 2 * GEM_GOAL_INCREASE, GEM_GOAL_STARTING_BOARD_SCORE + 2 * GEM_GOAL_INCREASE], // two goals reached
        [120, GEM_GOAL_STARTING_BOARD_SCORE], // edited below the old start: never below the new start
    ])('upgrades a version 3 save with a Gem goal of %i to a goal of %i', (oldGoal, newGoal) => {
        const current = createInitialGameState();
        localStorage.setItem(
            'blocksGameState',
            JSON.stringify({ version: 3, gameState: { ...current, gemGoalBoardScore: oldGoal } }),
        );
        expect(loadGameState()).toEqual({ ...current, gemGoalBoardScore: newGoal });
    });

    it("ignores a save whose board doesn't have width * height blocks", () => {
        const gameState = createInitialGameState();
        gameState.humanPlayer.board.width = 11;
        localStorage.setItem('blocksGameState', JSON.stringify({ version: 3, gameState }));
        expect(loadGameState()).toBeNull();
    });

    it('ignores a save with an unknown version', () => {
        localStorage.setItem('blocksGameState', JSON.stringify({ version: 99, gameState: createInitialGameState() }));
        expect(loadGameState()).toBeNull();
    });

    it('keeps a board size other than 10x10', () => {
        const gameState = createInitialGameState();
        gameState.humanPlayer.board = { width: 3, height: 2, blocks: gameState.humanPlayer.board.blocks.slice(0, 6) };
        saveGameState(gameState);
        expect(loadGameState()?.humanPlayer.board.width).toBe(3);
    });

    it('ignores a save that is not valid JSON', () => {
        localStorage.setItem('blocksGameState', '{not json');
        expect(loadGameState()).toBeNull();
    });
});
