import { exposeGameStateOnWindow, getGameState, setGameState } from '../../src/typescript/gamelogic/gameStateStore';
import type { GameState } from '../../src/typescript/types/GameState';
import { makeGameState } from '../helpers/testBoards';

/**
 * Tests for the game state store, and the window.gameState alias used from the browser console.
 */

const consoleWindow = window as unknown as { gameState: GameState };

describe('gameStateStore', () => {
    // This test must run first: it checks the store before anything has been set
    it('throws if the game state is read before it is set', () => {
        expect(() => getGameState()).toThrow();
    });

    it('returns the game state that was set', () => {
        const gameState = makeGameState();
        setGameState(gameState);
        expect(getGameState()).toBe(gameState);
    });

    describe('window.gameState (console access)', () => {
        beforeAll(() => {
            exposeGameStateOnWindow();
        });

        it('reads the game state in the store', () => {
            const gameState = makeGameState();
            setGameState(gameState);
            expect(consoleWindow.gameState).toBe(gameState);
        });

        it('lets the console change a field, and game logic sees it', () => {
            setGameState(makeGameState());
            consoleWindow.gameState.humanPlayer.totalScore = 99999;
            expect(getGameState().humanPlayer.totalScore).toBe(99999);
        });

        it('lets the console replace the whole game state, and game logic sees it', () => {
            setGameState(makeGameState());
            const replacement = makeGameState();
            consoleWindow.gameState = replacement;
            expect(getGameState()).toBe(replacement);
        });
    });
});
