import { getGameState } from './gameStateStore';
import { publishGameState } from './publishGameState';
import { takeComputerTurn } from './takeComputerTurn';

/**
 * Timer-driven game behavior: the computer player's moves.
 */

const COMPUTER_MOVE_INTERVAL_MS = 1000;

/**
 * Starts the game loop: the computer player takes a turn every COMPUTER_MOVE_INTERVAL_MS.
 */
export function startGameLoop(): void {
    setInterval(computerTick, COMPUTER_MOVE_INTERVAL_MS);
}

/**
 * Game-logic entry point for one tick of the computer player's timer.
 */
function computerTick(): void {
    const gameState = getGameState();
    takeComputerTurn(gameState);
    publishGameState(gameState);
}
