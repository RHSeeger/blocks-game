import { loadGameState, saveGameState } from '../../src/typescript/gamelogic/persistence';
import { createInitialGameState } from '../../src/typescript/gamelogic/createInitialGameState';

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
        localStorage.setItem('blocksGameState', JSON.stringify({ version: 2, gameState }));
        expect(loadGameState()).toBeNull();
    });

    it('upgrades a version 1 save (boards had no size) to 10x10 boards, keeping the progress', () => {
        const current = createInitialGameState();
        current.humanPlayer.totalScore = 500;
        const withoutSize = (board: { blocks: unknown[] }) => ({ blocks: board.blocks });
        const version1 = {
            ...current,
            humanPlayer: { ...current.humanPlayer, board: withoutSize(current.humanPlayer.board) },
            computerPlayer: { ...current.computerPlayer, board: withoutSize(current.computerPlayer.board) },
        };
        localStorage.setItem('blocksGameState', JSON.stringify({ version: 1, gameState: version1 }));
        expect(loadGameState()).toEqual(current);
    });

    it("ignores a save whose board doesn't have width * height blocks", () => {
        const gameState = createInitialGameState();
        gameState.humanPlayer.board.width = 11;
        localStorage.setItem('blocksGameState', JSON.stringify({ version: 2, gameState }));
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
