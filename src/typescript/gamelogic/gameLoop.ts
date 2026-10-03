import type { GameNotification } from '../types/GameNotification';
import type { GameState } from '../types/GameState';
import { AWAY_MIN_MS } from '../data/away';
import { getGameState } from './gameStateStore';
import { playWhileAway } from './playWhileAway';
import { publishGameState } from './publishGameState';
import { takeComputerTurn } from './takeComputerTurn';
import { getComputerTurnMs } from './upgrades';

/**
 * Timer-driven game behavior: the computer player's moves, including catching up on time away.
 */

/**
 * Starts the game loop: the computer player takes a turn, then waits before the next one. The wait is worked out from
 * the game state after every turn, so buying "Faster Computer" takes effect straight away.
 */
export function startGameLoop(): void {
    scheduleNextTick();
}

/**
 * Schedules the computer player's next turn.
 */
function scheduleNextTick(): void {
    setTimeout(computerTick, getComputerTurnMs(getGameState().computerPlayer));
}

/**
 * Game-logic entry point for one tick of the computer player's timer. Schedules the next tick afterwards.
 *
 * While the page is hidden (another tab, or the phone locked), the computer doesn't play: browsers slow down or stop
 * timers for hidden pages, by different amounts. The time is caught up on instead, once the page is shown again (see
 * runComputerTick), the same way as time with the page closed.
 */
function computerTick(): void {
    try {
        if (isPageHidden()) return;
        const gameState = getGameState();
        const notifications = runComputerTick(gameState, Date.now());
        publishGameState(gameState, notifications);
    } finally {
        scheduleNextTick();
    }
}

/**
 * Runs one tick of the computer player: first catches up on any time away (a gap of AWAY_MIN_MS or more since its
 * last turn), then takes its turn, and records when.
 *
 * @param gameState - The game state (updated in place)
 * @param now - The current time, in milliseconds since 1970
 * @returns Notifications for what happened (including a summary of the time away, if there was any)
 */
export function runComputerTick(gameState: GameState, now: number): GameNotification[] {
    const gap = now - gameState.computerLastTurnAt;
    const away = gap >= AWAY_MIN_MS ? [playWhileAway(gameState, gap)] : [];
    const turn = takeComputerTurn(gameState);
    gameState.computerLastTurnAt = now;
    return [...away, ...turn];
}

/**
 * Determines whether the page is hidden (in a background tab, minimized, or the phone is locked).
 *
 * @returns True if the page is hidden
 */
function isPageHidden(): boolean {
    return typeof document !== 'undefined' && document.visibilityState === 'hidden';
}
