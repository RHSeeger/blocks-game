import type { CurrencyId } from '../types/CurrencyId';
import { onGrantAchievementClicked, onGrantCurrencyClicked } from '../bridge/uiToLogic';
import { getElement } from './getElement';

/**
 * The debug tools: a switch on the Settings tab that shows buttons for granting achievements and adding currency, so
 * new features can be tested without having to earn them first.
 *
 * Whether the tools are shown is kept on the page (the `debug-mode` class on the body, which the CSS reads to show
 * every `.debug-only` element), not in the game state, the same way the current tab is. It isn't saved, so the tools
 * are hidden again after a reload.
 */

/** The currencies the debug buttons can add */
const CURRENCIES: readonly CurrencyId[] = ['coins', 'chips', 'gems'];

/**
 * Sets up the debug tools' switch and buttons. Called once at startup.
 */
export function setUpDebugTools(): void {
    const toggle = getElement('debug-tools-toggle');
    toggle.addEventListener('click', () => setDebugMode(!document.body.classList.contains('debug-mode')));

    getElement('debug-currency-buttons').addEventListener('click', (event) => {
        const button = (event.target as HTMLElement).closest<HTMLElement>('.debug-grant-currency');
        const currency = button?.dataset.currency as CurrencyId | undefined;
        const amount = Number(button?.dataset.amount);
        if (currency !== undefined && CURRENCIES.includes(currency)) onGrantCurrencyClicked(currency, amount);
    });

    // One handler on the list handles every Grant button, so redrawing the list doesn't need to attach new handlers
    getElement('achievements-list').addEventListener('click', (event) => {
        const button = (event.target as HTMLElement).closest<HTMLElement>('.grant-achievement-btn');
        const achievement = button?.dataset.achievement;
        if (achievement !== undefined) onGrantAchievementClicked(achievement);
    });
}

/**
 * Shows or hides the debug tools.
 *
 * @param on - Whether they should be shown
 */
export function setDebugMode(on: boolean): void {
    document.body.classList.toggle('debug-mode', on);
    const toggle = getElement('debug-tools-toggle');
    toggle.setAttribute('aria-pressed', String(on));
    toggle.textContent = on ? 'Hide Debug Tools' : 'Show Debug Tools';
}
