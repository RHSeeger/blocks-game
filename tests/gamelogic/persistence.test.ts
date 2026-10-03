import { loadGameState, saveGameState } from '../../src/typescript/gamelogic/persistence';
import { createInitialGameState } from '../../src/typescript/gamelogic/createInitialGameState';
import { generateBoard } from '../../src/typescript/gamelogic/board/generateBoard';
import { ACHIEVEMENT_GEMS, FIRST_CLEAR, GROUP_20 } from '../../src/typescript/data/achievements';
import { GEM_GOAL_INCREASE, GEM_GOAL_STARTING_BOARD_SCORE } from '../../src/typescript/data/gems';

/**
 * Tests for saving and loading the game state.
 */

describe('persistence', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('loads exactly what was saved', () => {
        const gameState = createInitialGameState();
        gameState.humanPlayer.totalScore = 1234;
        gameState.humanPlayer.selectedIndices = [3, 4];
        gameState.accomplishedAchievements = ['first_clear'];
        saveGameState(gameState);
        expect(loadGameState()).toEqual(gameState);
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
        current.humanPlayer.board = generateBoard(10, 10, 0);
        current.computerPlayer.board = generateBoard(10, 10, 0);
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

        const loaded = loadGameState();
        expect(loaded).toEqual({ ...current, wallet: { coins: 0, chips: 0, gems: 2 * ACHIEVEMENT_GEMS } });
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
