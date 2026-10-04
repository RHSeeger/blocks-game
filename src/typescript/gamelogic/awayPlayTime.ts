import { AWAY_SPEED_KEPT_BY_LEVEL, AWAY_STEP_ENDS_MS } from '../data/away';

/**
 * How much play time away from the game is worth to the computer player (used by playWhileAway, and to describe the
 * "Better While Away" Upgrade).
 */

/**
 * Returns how much full-speed play some time away is worth: each step of AWAY_STEP_ENDS_MS counted at its speed (full
 * speed for the first 15 minutes, then each step at the given share of the speed of the one before), and nothing past
 * the last step.
 *
 * @param awayMs - How long the computer couldn't play, in milliseconds
 * @param speedKept - The share of the speed each step keeps from the one before (default: with no Upgrade levels)
 * @returns The time it plays for, in milliseconds
 */
export function getAwayPlayMs(awayMs: number, speedKept: number = AWAY_SPEED_KEPT_BY_LEVEL[0]): number {
    return AWAY_STEP_ENDS_MS.reduce((played, untilMs, step) => {
        const stepStart = step === 0 ? 0 : AWAY_STEP_ENDS_MS[step - 1];
        return played + Math.max(0, Math.min(awayMs, untilMs) - stepStart) * speedKept ** step;
    }, 0);
}
