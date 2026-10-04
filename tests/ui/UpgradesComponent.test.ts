import { renderUpgrades, renderWallet } from '../../src/typescript/ui/UpgradesComponent';
import { BOARD_SIZE, COMPUTER_SPEED, PLUS1_CHANCE } from '../../src/typescript/data/upgrades';
import type { UpgradeOffer } from '../../src/typescript/types/UpgradeOffer';
import { makeGameState } from '../helpers/testBoards';

/**
 * Tests for drawing the wallet and the Upgrades tab.
 */

/** Returns an Upgrade offer for the tests, with any fields given replacing the defaults */
const offer = (overrides: Partial<UpgradeOffer>): UpgradeOffer => ({
    upgrade: COMPUTER_SPEED,
    player: 'computer',
    level: 0,
    effect: 'A turn every 1.00 seconds',
    currency: 'coins',
    cost: 30,
    canBuy: true,
    ...overrides,
});

/** Returns the Upgrades tab's list item whose text includes this text */
const item = (text: string) =>
    [...document.querySelectorAll('#upgrades-list li')].find((li) => li.textContent?.includes(text)) as HTMLElement;

describe('renderWallet', () => {
    it('shows each currency', () => {
        document.body.innerHTML =
            '<span id="wallet-coins"></span><span id="wallet-chips"></span><span id="wallet-gems"></span>';
        const gameState = makeGameState();
        gameState.wallet = { coins: 12, chips: 34, gems: 5 };
        renderWallet(gameState);
        expect(document.getElementById('wallet-coins')?.textContent).toBe('12');
        expect(document.getElementById('wallet-chips')?.textContent).toBe('34');
        expect(document.getElementById('wallet-gems')?.textContent).toBe('5');
    });
});

describe('renderUpgrades', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="upgrades-list"></div>';
    });

    it('shows a Buy button with the cost and currency, for the right player', () => {
        renderUpgrades([offer({})]);
        const button = item('Faster Computer').querySelector('button') as HTMLButtonElement;
        expect(button.textContent).toContain('30 Coins');
        expect(button.dataset.upgrade).toBe(COMPUTER_SPEED);
        expect(button.dataset.player).toBe('computer');
        expect(button.disabled).toBe(false);
    });

    it('disables the Buy button when it cannot be bought', () => {
        renderUpgrades([offer({ canBuy: false })]);
        expect((item('Faster Computer').querySelector('button') as HTMLButtonElement).disabled).toBe(true);
    });

    it('shows what is required, or that the highest level is reached, instead of a Buy button', () => {
        renderUpgrades([
            offer({ upgrade: PLUS1_CHANCE, player: 'human', currency: 'chips', requires: '+1 Blocks', canBuy: false }),
            offer({ upgrade: BOARD_SIZE, player: 'human', currency: 'gems', cost: undefined, canBuy: false }),
        ]);
        expect(item('+1 Block Chance').textContent).toContain('Requires +1 Blocks');
        expect(item('+1 Block Chance').querySelector('button')).toBeNull();
        expect(item('Bigger Board').textContent).toContain('Max level');
    });

    it('does not replace the list when nothing has changed, so clicks are not lost', () => {
        renderUpgrades([offer({})]);
        const button = item('Faster Computer').querySelector('button');
        renderUpgrades([offer({})]);
        expect(item('Faster Computer').querySelector('button')).toBe(button);
    });
});
