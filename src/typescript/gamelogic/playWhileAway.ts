import type { GameNotification } from '../types/GameNotification';
import type { GameState } from '../types/GameState';
import { AWAY_MAX_MS, AWAY_PLAY_BUDGET_MS, AWAY_RATES } from '../data/away';
import { COMPUTER_MILESTONE_GEMS } from '../data/gems';
import { getNextComputerMilestone } from './gems';
import { takeComputerTurn } from './takeComputerTurn';
import { getComputerTurnMs } from './upgrades';

/**
 * Progress while away: the computer player catches up on the turns it missed while it couldn't play.
 */

/**
 * Returns how much full-speed play some time away is worth: each step of AWAY_RATES counted at its rate (full speed
 * for the first 15 minutes, then slower and slower), and nothing past the last step.
 *
 * @param awayMs - How long the computer couldn't play, in milliseconds
 * @returns The time it plays for, in milliseconds
 */
export function getAwayPlayMs(awayMs: number): number {
    let played = 0;
    let stepStart = 0;
    for (const { untilMs, rate } of AWAY_RATES) {
        played += Math.max(0, Math.min(awayMs, untilMs) - stepStart) * rate;
        stepStart = untilMs;
    }
    return played;
}

/**
 * Plays the computer player's missed turns, for time away. The number of turns is how much play the time away is
 * worth (see getAwayPlayMs) divided by the time between the computer's turns.
 *
 * The turns are really played, one after another, for as long as the time budget allows. If they don't all fit, the
 * rest are estimated from the ones that were played: the score (and Chips) and the number of boards finished grow at
 * the same rate, and a Gem is added for each milestone board passed. (The board in play stays as the turns that were
 * played left it.)
 *
 * @param gameState - The game state (updated in place)
 * @param awayMs - How long the computer couldn't play, in milliseconds
 * @param budgetMs - How long to spend playing turns before estimating the rest (milliseconds of real time)
 * @param clock - Returns the current time in milliseconds (replaceable for tests)
 * @returns An `awayProgress` notification summing up what the computer finished and earned
 */
export function playWhileAway(
    gameState: GameState,
    awayMs: number,
    budgetMs = AWAY_PLAY_BUDGET_MS,
    clock: () => number = Date.now,
): GameNotification {
    const computer = gameState.computerPlayer;
    const playMs = getAwayPlayMs(awayMs);
    const turns = Math.floor(playMs / getComputerTurnMs(computer));
    const before = { boardNumber: computer.boardNumber, score: computer.totalScore, gems: gameState.wallet.gems };

    const started = clock();
    let played = 0;
    while (played < turns && clock() - started < budgetMs) {
        takeComputerTurn(gameState); // its notifications (such as milestone Gems) are summed up below instead
        played++;
    }
    if (played > 0 && played < turns) {
        estimateRemainingTurns(gameState, before, turns / played - 1);
    }

    return {
        kind: 'awayProgress',
        awayMs,
        playMs,
        capped: awayMs > AWAY_MAX_MS,
        boards: computer.boardNumber - before.boardNumber,
        score: computer.totalScore - before.score,
        gems: gameState.wallet.gems - before.gems,
    };
}

/**
 * Adds an estimate of the turns that weren't played: the computer's score (and the same in Chips) and boards finished
 * grow by the given multiple of what the played turns gained, plus a Gem for each milestone board passed.
 *
 * @param gameState - The game state (updated in place)
 * @param before - The computer's board number and score, and the Gems in the wallet, before the turns were played
 * @param multiple - The turns not played, as a multiple of the turns that were
 */
function estimateRemainingTurns(
    gameState: GameState,
    before: { boardNumber: number; score: number },
    multiple: number,
): void {
    const computer = gameState.computerPlayer;
    const extraScore = Math.round((computer.totalScore - before.score) * multiple);
    const extraBoards = Math.floor((computer.boardNumber - before.boardNumber) * multiple);
    computer.totalScore += extraScore;
    gameState.wallet.chips += extraScore;

    // The boards in play from now until the new board number are finished: each milestone among them earns a Gem
    const newBoardNumber = computer.boardNumber + extraBoards;
    for (let milestone = getNextComputerMilestone(computer.boardNumber); milestone < newBoardNumber; milestone *= 2) {
        gameState.wallet.gems += COMPUTER_MILESTONE_GEMS;
    }
    computer.boardNumber = newBoardNumber;
}
