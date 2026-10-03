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
 * How fast the computer plays while away, by how long it's been away. The time away is split into these steps, each
 * counted at its rate: full speed for the first 15 minutes, then half, quarter, and so on, halving each time the time
 * away doubles. Each step after the first is worth the same (7.5 minutes of full-speed play), so a short break loses
 * little, coming back later always gives a bit more, and the most it can be worth is an hour of play. Nothing after
 * the last step counts.
 */
export const AWAY_RATES: readonly { readonly untilMs: number; readonly rate: number }[] = [
    { untilMs: 15 * MINUTE, rate: 1 },
    { untilMs: 30 * MINUTE, rate: 1 / 2 },
    { untilMs: 1 * HOUR, rate: 1 / 4 },
    { untilMs: 2 * HOUR, rate: 1 / 8 },
    { untilMs: 4 * HOUR, rate: 1 / 16 },
    { untilMs: 8 * HOUR, rate: 1 / 32 },
    { untilMs: 16 * HOUR, rate: 1 / 64 },
];

/** Time away past this doesn't count at all (the end of the last step in AWAY_RATES) */
export const AWAY_MAX_MS = AWAY_RATES[AWAY_RATES.length - 1].untilMs;

/**
 * How long catching up may spend playing the computer's missed turns, so the page doesn't freeze. Turns that don't
 * fit are estimated from the ones that were played
 */
export const AWAY_PLAY_BUDGET_MS = 200;
