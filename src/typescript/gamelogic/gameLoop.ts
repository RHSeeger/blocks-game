import { getGameState } from './gameStateStore';
import { publishGameState } from './publishGameState';
import { takeComputerTurn } from './takeComputerTurn';
import { getComputerTurnMs } from './upgrades';

/**
 * Timer-driven game behavior: the computer player's moves.
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
 */
function computerTick(): void {
    try {
        const gameState = getGameState();
        const notifications = takeComputerTurn(gameState);
        publishGameState(gameState, notifications);
    } finally {
        scheduleNextTick();
    }
}
