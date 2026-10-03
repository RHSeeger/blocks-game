import type { CurrencyId } from '../../types/CurrencyId';
import { getGameState } from '../gameStateStore';
import { publishGameState } from '../publishGameState';

/**
 * Game-logic entry point: the user used the debug tools to give themselves some currency.
 */

/**
 * Adds an amount of a currency to the wallet. Does nothing for an unknown currency, or an amount that isn't a whole
 * number above 0. (A debug tool, for testing Upgrades without having to earn the currency.)
 *
 * @param currency - Which currency
 * @param amount - How much to add
 */
export function grantCurrency(currency: CurrencyId, amount: number): void {
    if (!Number.isInteger(amount) || amount <= 0) return;
    const gameState = getGameState();
    if (!(currency in gameState.wallet)) return;
    gameState.wallet[currency] += amount;
    publishGameState(gameState);
}
