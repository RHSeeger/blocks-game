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
        localStorage.setItem('blocksGameState', JSON.stringify({ version: 1, gameState }));
        expect(loadGameState()).toBeNull();
    });

    it('ignores a save that is not valid JSON', () => {
        localStorage.setItem('blocksGameState', '{not json');
        expect(loadGameState()).toBeNull();
    });
});
