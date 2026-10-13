import { getElement } from './getElement';

/**
 * The tabs (Main, Achievements, ...): switching which tab is shown, and the phone-sized dropdown.
 *
 * On wider screens the tab buttons are shown in a row. On phones (see styles.css) only a toggle is shown: a single
 * "tab" with the current tab's name and a dropdown arrow. Clicking it opens a menu of the tab buttons; picking one
 * shows that tab and closes the menu. The same tab buttons are used for both, so there is one list of tabs.
 *
 * When an Upgrade can be bought, a dot is shown on the Upgrades tab (and on the dropdown toggle).
 */

/**
 * Sets up the tab buttons and the dropdown toggle. Called once at startup.
 */
export function setUpTabs(): void {
    const nav = getElement('tabs');
    const toggle = getElement('tabs-toggle');

    document.querySelectorAll<HTMLElement>('.tab-button').forEach((button) => {
        button.addEventListener('click', () => {
            showTab(button.dataset.tab ?? 'main');
            setMenuOpen(nav, toggle, false);
        });
    });
    toggle.addEventListener('click', () => setMenuOpen(nav, toggle, !nav.classList.contains('open')));
    // A click anywhere else closes the menu. This listens in the capture phase so it also sees clicks that are
    // stopped before they reach the document (such as clicks on the board)
    document.addEventListener(
        'click',
        (event) => {
            if (!nav.contains(event.target as Node)) setMenuOpen(nav, toggle, false);
        },
        true,
    );
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') setMenuOpen(nav, toggle, false);
    });
}

/**
 * Shows one tab and hides the others, and shows its name on the dropdown toggle.
 *
 * @param tab - The name of the tab to show (its button's `data-tab` value)
 */
export function showTab(tab: string): void {
    document.querySelectorAll<HTMLElement>('.tab-button').forEach((button) => {
        const isActive = button.dataset.tab === tab;
        button.classList.toggle('active', isActive);
        if (isActive) getElement('tabs-toggle-label').textContent = button.textContent;
    });
    document
        .querySelectorAll<HTMLElement>('.tab-content')
        .forEach((content) => content.classList.toggle('active', content.id === `${tab}-tab`));
}

/**
 * Shows or hides the dot that says an Upgrade can be bought, on the Upgrades tab and on the phone-sized dropdown
 * toggle (on phones the menu is usually closed, so the toggle is the only part of the tabs that shows).
 *
 * @param canBuyAny - Whether at least one Upgrade can be bought right now
 */
export function renderUpgradesReady(canBuyAny: boolean): void {
    const upgradesTab = document.querySelector<HTMLElement>('.tab-button[data-tab="upgrades"]');
    const toggle = getElement('tabs-toggle');
    [upgradesTab, toggle].forEach((element) => element?.classList.toggle('upgrades-ready', canBuyAny));
    if (upgradesTab !== null) {
        upgradesTab.setAttribute('aria-label', canBuyAny ? 'Upgrades (some can be bought)' : 'Upgrades');
    }
    toggle.setAttribute('aria-label', canBuyAny ? 'Choose a tab (Upgrades can be bought)' : 'Choose a tab');
}

/**
 * Opens or closes the dropdown menu of tabs (only visible on phones).
 *
 * @param nav - The tabs element
 * @param toggle - The dropdown toggle button
 * @param open - Whether the menu should be open
 */
function setMenuOpen(nav: HTMLElement, toggle: HTMLElement, open: boolean): void {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
}
