/**
 * The values for progress while away: how the computer player catches up on the time it couldn't play (the page was
 * closed, the phone was locked, or the tab was in the background).
 */

/**
 * A gap this long or longer since the computer player's last turn counts as time away (normal turns are 1 second apart
 * or less)
 */
export const AWAY_MIN_MS = 60 * 1000;

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

/**
 * The steps time away is split into, by when each one ends: the first 15 minutes, then up to 30 minutes, 1 hour, 2
 * hours, and so on, each step as long as all the ones before it. The first step counts at full speed, and each step
 * after it at a share of the one before (see AWAY_SPEED_KEPT_BY_LEVEL). Nothing after the last step counts.
 */
export const AWAY_STEP_ENDS_MS: readonly number[] = [
    15 * MINUTE,
    30 * MINUTE,
    1 * HOUR,
    2 * HOUR,
    4 * HOUR,
    8 * HOUR,
    16 * HOUR,
];

/**
 * How much of the previous step's speed each step of time away keeps, by level of the "Better While Away" Upgrade
 * (index = level). With no levels it's half: full speed, then half, a quarter, and so on, so each step after the first
 * is worth the same 7.5 minutes of play, and the most time away can be worth is an hour. Each level slows the computer
 * down less, so a long time away is worth much more (8 hours: 52.5 minutes of play, up to 2.7 hours at the last level;
 * 16 hours: 1 hour, up to 4.1 hours), while a short break changes little.
 */
export const AWAY_SPEED_KEPT_BY_LEVEL: readonly number[] = [0.5, 0.55, 0.6, 0.65, 0.7, 0.75];

/** Time away past this doesn't count at all (the end of the last step in AWAY_STEP_ENDS_MS) */
export const AWAY_MAX_MS = AWAY_STEP_ENDS_MS[AWAY_STEP_ENDS_MS.length - 1];

/**
 * How long catching up may spend playing the computer's missed turns, so the page doesn't freeze. Turns that don't
 * fit are estimated from the ones that were played
 */
export const AWAY_PLAY_BUDGET_MS = 200;
