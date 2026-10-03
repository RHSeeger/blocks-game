/**
 * The values for progress while away: how the computer player catches up on the time it couldn't play (the page was
 * closed, the phone was locked, or the tab was in the background).
 */

/**
 * A gap this long or longer since the computer player's last turn counts as time away (normal turns are 1 second apart
 * or less)
 */
export const AWAY_MIN_MS = 60 * 1000;

/** Time away is counted up to this long */
export const AWAY_MAX_MS = 8 * 60 * 60 * 1000;

/**
 * How long catching up may spend playing the computer's missed turns, so the page doesn't freeze. Turns that don't
 * fit are estimated from the ones that were played
 */
export const AWAY_PLAY_BUDGET_MS = 200;
