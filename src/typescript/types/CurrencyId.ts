/**
 * Defines the CurrencyId type: the currencies Upgrades can be bought with.
 */

/**
 * The currencies Upgrades can be bought with (see design/game-design.md, "Currencies").
 * - `coins`: earned by the human player's Score; buys everyday Upgrades for the computer player
 * - `chips`: earned by the computer player's score; buys everyday Upgrades for the human player
 * - `gems`: earned from achievements and goals; buys game-changing Upgrades for either player
 */
export type CurrencyId = 'coins' | 'chips' | 'gems';
