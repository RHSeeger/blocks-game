import type { CurrencyId } from '../types/CurrencyId';
import type { PlayerId } from '../types/PlayerId';
import type { ReadonlyGameState } from '../types/ReadonlyGameState';
import type { UpgradeOffer } from '../types/UpgradeOffer';
import { ALL_UPGRADES } from '../data/upgrades';
import { getElement } from './getElement';

/**
 * Draws the wallet (shown above the tabs) and the Upgrades tab.
 */

const CURRENCY_NAMES: Record<CurrencyId, string> = { coins: 'Coins', chips: 'Chips', gems: 'Gems' };

const PLAYER_SECTIONS: readonly { player: PlayerId; title: string }[] = [
    { player: 'human', title: 'Human Player' },
    { player: 'computer', title: 'Computer Player' },
];

/**
 * Draws the wallet: how much of each currency there is to spend.
 *
 * @param gameState - The game state (read-only)
 */
export function renderWallet(gameState: ReadonlyGameState): void {
    getElement('wallet-coins').textContent = String(gameState.wallet.coins);
    getElement('wallet-chips').textContent = String(gameState.wallet.chips);
    getElement('wallet-gems').textContent = String(gameState.wallet.gems);
}

/**
 * Draws the Upgrades tab: a section for each player, listing each Upgrade with its level, what it does now, and a
 * Buy button for the next level. Each Buy button has `data-upgrade` and `data-player` attributes, used by the click
 * handler set up in initializeUi.
 *
 * The list is only replaced when something in it has changed, so a click that lands while the game is redrawing (which
 * happens every computer turn) isn't lost.
 *
 * @param offers - Every Upgrade for each player, as it can be bought right now (calculated by game logic)
 */
export function renderUpgrades(offers: readonly UpgradeOffer[]): void {
    const html = PLAYER_SECTIONS.map(({ player, title }) => {
        const items = offers.filter((offer) => offer.player === player).map(renderOffer);
        return `<div class="upgrades-section"><h3>${title}</h3><ul class="upgrade-list">${items.join('')}</ul></div>`;
    }).join('');
    const list = getElement('upgrades-list');
    if (list.dataset.renderedHtml !== html) {
        list.innerHTML = html;
        list.dataset.renderedHtml = html;
    }
}

/**
 * Returns the HTML for one Upgrade in the list.
 *
 * @param offer - The Upgrade, for one player, as it can be bought right now
 * @returns The HTML for the list item
 */
function renderOffer(offer: UpgradeOffer): string {
    const definition = ALL_UPGRADES.find((upgrade) => upgrade.internalName === offer.upgrade);
    const tierClass = definition?.tier === 'gameChanging' ? ' game-changing' : '';
    let action: string;
    if (offer.requires !== undefined) {
        action = `<span class="upgrade-locked">Requires ${offer.requires}</span>`;
    } else if (offer.cost === undefined) {
        action = '<span class="upgrade-max">Max level</span>';
    } else {
        action = `<button class="buy-upgrade-btn" data-upgrade="${offer.upgrade}" data-player="${offer.player}"
            ${offer.canBuy ? '' : 'disabled'}>Buy: ${offer.cost} ${CURRENCY_NAMES[offer.currency]}</button>`;
    }
    return `<li class="upgrade${tierClass}${offer.requires !== undefined ? ' locked' : ''}">
            <div><b>${definition?.displayName ?? offer.upgrade}</b> <span class="upgrade-level">Level ${offer.level}</span></div>
            <div class="upgrade-description">${definition?.description ?? ''}</div>
            <div class="upgrade-effect">Now: ${offer.effect}</div>
            <div>${action}</div>
        </li>`;
}
