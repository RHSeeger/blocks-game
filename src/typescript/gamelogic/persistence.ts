import type { GameState } from '../types/GameState';
import { BOARD_SIZE } from '../data/board';

/**
 * Saves the game state to localStorage, and loads it back, so it is kept across page reloads.
 *
 * The game state is plain data, so it is saved as-is with JSON. A version number is saved alongside it; a save with a
 * missing or different version (including saves from before this format existed) is ignored.
 */

const SAVE_KEY = 'blocksGameState';
const SAVE_VERSION = 1;

/**
 * Saves the game state to localStorage.
 *
 * @param gameState - The game state to save
 */
export function saveGameState(gameState: GameState): void {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify({ version: SAVE_VERSION, gameState }));
    } catch (error) {
        console.error('Failed to save the game state', error);
    }
}

/**
 * Loads the game state from localStorage.
 *
 * @returns The saved game state, or null if there is no save or it is not in a recognized format
 */
export function loadGameState(): GameState | null {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (raw === null) return null;
        const saved: unknown = JSON.parse(raw);
        if (!isRecord(saved) || saved.version !== SAVE_VERSION || !isGameState(saved.gameState)) {
            console.warn('Ignoring the saved game state: it is not in a recognized format');
            return null;
        }
        return saved.gameState;
    } catch (error) {
        console.warn('Ignoring the saved game state: it could not be read', error);
        return null;
    }
}

/**
 * Checks that a value has the shape of a GameState.
 *
 * @param value - The value to check
 * @returns True if the value looks like a GameState
 */
function isGameState(value: unknown): value is GameState {
    return (
        isRecord(value) &&
        isPlayerState(value.humanPlayer) &&
        isPlayerState(value.computerPlayer) &&
        Array.isArray(value.accomplishedAchievements) &&
        isRecord(value.gameStats) &&
        typeof value.gameStats.largestGroup === 'number' &&
        isRecord(value.gameStats.groupSizeCounts)
    );
}

/**
 * Checks that a value has the shape of a PlayerState.
 *
 * @param value - The value to check
 * @returns True if the value looks like a PlayerState
 */
function isPlayerState(value: unknown): boolean {
    return (
        isRecord(value) &&
        isRecord(value.board) &&
        Array.isArray(value.board.blocks) &&
        value.board.blocks.length === BOARD_SIZE &&
        typeof value.totalScore === 'number' &&
        typeof value.boardScore === 'number' &&
        typeof value.maxBoardScore === 'number' &&
        typeof value.boardNumber === 'number' &&
        Array.isArray(value.selectedIndices) &&
        Array.isArray(value.augmentations)
    );
}

/**
 * Checks that a value is a non-null object, so its fields can be inspected.
 *
 * @param value - The value to check
 * @returns True if the value is a non-null object
 */
function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}
