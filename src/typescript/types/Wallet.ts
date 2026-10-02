import type { CurrencyId } from './CurrencyId';

/**
 * Defines the Wallet type: how much of each currency is available to spend.
 */

/**
 * How much of each currency is available to spend. There is one shared wallet: the human player decides what to buy
 * for both players.
 */
export type Wallet = Record<CurrencyId, number>;
