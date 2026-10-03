import type { GameState } from '../types/GameState';
import { ALL_ACHIEVEMENTS } from '../data/achievements';
import { GEM_GOAL_STARTING_BOARD_SCORE } from '../data/gems';

/**
 * Saves the game state to localStorage, and loads it back, so it is kept across page reloads.
 *
 * The game state is plain data, so it is saved as-is with JSON. A version number is saved alongside it. Saves from an
 * older version are upgraded when loaded; a save with a missing or unknown version is ignored.
 *
 * Versions:
 * - 1: boards had no size stored (always 10x10)
 * - 2: each board stores its own width and height
 * - 3: adds the wallet (Coins, Chips, Gems), the Gem goal, and each player's Upgrade levels
 * - 4: the human player's starting board got smaller (10x10 to 8x8), so the Gem goal starts lower. The shape of the
 *   state didn't change; only the goal's value is adjusted
 * - 5: Score 1000! now unlocks Line Blocks. The shape didn't change. (This upgrade used to apply the unlocks of the
 *   achievements already accomplished; that now happens on every load, see applyMissingUnlocks)
 *
 * Every load (whatever the version) also applies the unlock of each achievement already accomplished, if the player
 * doesn't have it yet. Achievements only unlock things when they're first accomplished, so without this, an unlock
 * added to an achievement later would never reach the players who already have it.
 */

const SAVE_KEY = 'blocksGameState';
const SAVE_VERSION = 5;

/** The size of every board in a version 1 save */
const VERSION_1_BOARD_SIZE = 10;

/** The Gem goal's starting board score in version 3 saves (before the human player's starting board got smaller) */
const VERSION_3_GEM_GOAL_START = 175;

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
        const gameState = isRecord(saved) ? upgradeSave(saved.version, saved.gameState) : undefined;
        if (!isGameState(gameState)) {
            console.warn('Ignoring the saved game state: it is not in a recognized format');
            return null;
        }
        return applyMissingUnlocks(gameState);
    } catch (error) {
        console.warn('Ignoring the saved game state: it could not be read', error);
        return null;
    }
}

/**
 * Upgrades a saved game state from an older save version to the current one, one version at a time.
 *
 * @param version - The save's version
 * @param gameState - The saved game state (not yet checked)
 * @returns The game state in the current format (still to be checked), or undefined if the version is unknown
 */
function upgradeSave(version: unknown, gameState: unknown): unknown {
    if (version === SAVE_VERSION) return gameState;
    if (!isRecord(gameState)) return undefined;
    if (version === 1) return upgradeSave(2, upgradeFromVersion1(gameState));
    if (version === 2) return upgradeSave(3, upgradeFromVersion2(gameState));
    if (version === 3) return upgradeSave(4, upgradeFromVersion3(gameState));
    if (version === 4) return upgradeSave(5, gameState);
    return undefined;
}

/**
 * Applies the unlock of every achievement already accomplished, for the player it names, if they don't have that
 * Augmentation yet.
 *
 * @param gameState - The loaded game state (updated in place)
 * @returns The same game state
 */
function applyMissingUnlocks(gameState: GameState): GameState {
    ALL_ACHIEVEMENTS.filter((a) => gameState.accomplishedAchievements.includes(a.internalName)).forEach((a) => {
        if (a.unlocks === undefined) return;
        const playerState = a.unlocks.player === 'human' ? gameState.humanPlayer : gameState.computerPlayer;
        if (!playerState.augmentations.includes(a.unlocks.augmentation)) {
            playerState.augmentations.push(a.unlocks.augmentation);
        }
    });
    return gameState;
}

/**
 * Upgrades a version 1 save to version 2: every board gets a size of 10x10.
 *
 * @param gameState - The version 1 game state
 * @returns The version 2 game state
 */
function upgradeFromVersion1(gameState: Record<string, unknown>): Record<string, unknown> {
    const addBoardSize = (player: unknown) =>
        isRecord(player) && isRecord(player.board)
            ? { ...player, board: { ...player.board, width: VERSION_1_BOARD_SIZE, height: VERSION_1_BOARD_SIZE } }
            : player;
    return {
        ...gameState,
        humanPlayer: addBoardSize(gameState.humanPlayer),
        computerPlayer: addBoardSize(gameState.computerPlayer),
    };
}

/**
 * Upgrades a version 2 save to version 3: adds an empty wallet (plus the Gems for any achievements already
 * accomplished), the starting Gem goal, and no Upgrade levels for either player.
 *
 * @param gameState - The version 2 game state
 * @returns The version 3 game state
 */
function upgradeFromVersion2(gameState: Record<string, unknown>): Record<string, unknown> {
    const accomplished = Array.isArray(gameState.accomplishedAchievements) ? gameState.accomplishedAchievements : [];
    const gems = ALL_ACHIEVEMENTS.filter((a) => accomplished.includes(a.internalName)).reduce(
        (total, achievement) => total + achievement.gems,
        0,
    );
    const addUpgradeLevels = (player: unknown) => (isRecord(player) ? { ...player, upgradeLevels: {} } : player);
    return {
        ...gameState,
        humanPlayer: addUpgradeLevels(gameState.humanPlayer),
        computerPlayer: addUpgradeLevels(gameState.computerPlayer),
        wallet: { coins: 0, chips: 0, gems },
        gemGoalBoardScore: VERSION_3_GEM_GOAL_START,
    };
}

/**
 * Upgrades a version 3 save to version 4: the Gem goal moves down by as much as its starting value did, so a player
 * keeps the goals they've already reached (each one still raises it by the same amount). It never goes below the new
 * starting value.
 *
 * @param gameState - The version 3 game state
 * @returns The version 4 game state
 */
function upgradeFromVersion3(gameState: Record<string, unknown>): Record<string, unknown> {
    const goal = gameState.gemGoalBoardScore;
    if (typeof goal !== 'number') return gameState;
    const lowered = goal - (VERSION_3_GEM_GOAL_START - GEM_GOAL_STARTING_BOARD_SCORE);
    return { ...gameState, gemGoalBoardScore: Math.max(lowered, GEM_GOAL_STARTING_BOARD_SCORE) };
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
        isRecord(value.gameStats.groupSizeCounts) &&
        isRecord(value.wallet) &&
        typeof value.wallet.coins === 'number' &&
        typeof value.wallet.chips === 'number' &&
        typeof value.wallet.gems === 'number' &&
        typeof value.gemGoalBoardScore === 'number'
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
        isPositiveInteger(value.board.width) &&
        isPositiveInteger(value.board.height) &&
        Array.isArray(value.board.blocks) &&
        value.board.blocks.length === value.board.width * value.board.height &&
        typeof value.totalScore === 'number' &&
        typeof value.boardScore === 'number' &&
        typeof value.maxBoardScore === 'number' &&
        typeof value.boardNumber === 'number' &&
        Array.isArray(value.selectedIndices) &&
        Array.isArray(value.augmentations) &&
        isRecord(value.upgradeLevels)
    );
}

/**
 * Checks that a value is a whole number greater than 0.
 *
 * @param value - The value to check
 * @returns True if the value is a positive integer
 */
function isPositiveInteger(value: unknown): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value > 0;
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
