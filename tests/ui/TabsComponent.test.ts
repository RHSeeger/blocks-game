import { setUpTabs, showTab } from '../../src/typescript/ui/TabsComponent';

/**
 * Tests for the tabs: switching tabs, and the phone-sized dropdown (its toggle shows the current tab, and opens and
 * closes the menu of tabs).
 */

const nav = () => document.getElementById('tabs') as HTMLElement;
const toggle = () => document.getElementById('tabs-toggle') as HTMLElement;
const tabButton = (tab: string) => document.querySelector(`.tab-button[data-tab="${tab}"]`) as HTMLElement;
const isOpen = () => nav().classList.contains('open');

describe('tabs', () => {
    beforeAll(() => {
        // The listeners are added to the document once, as at startup
        document.body.innerHTML = `
            <nav class="tabs" id="tabs">
                <button id="tabs-toggle" aria-expanded="false"><span id="tabs-toggle-label">Main</span></button>
                <div class="tab-list">
                    <button class="tab-button active" data-tab="main">Main</button>
                    <button class="tab-button" data-tab="stats">Stats</button>
                </div>
            </nav>
            <section id="main-tab" class="tab-content active"></section>
            <section id="stats-tab" class="tab-content"></section>
            <div id="elsewhere"></div>`;
        setUpTabs();
    });

    beforeEach(() => {
        showTab('main');
        nav().classList.remove('open');
    });

    it('shows the tab whose button is clicked, and only that tab', () => {
        tabButton('stats').click();
        expect(document.getElementById('stats-tab')?.classList.contains('active')).toBe(true);
        expect(document.getElementById('main-tab')?.classList.contains('active')).toBe(false);
        expect(tabButton('stats').classList.contains('active')).toBe(true);
        expect(tabButton('main').classList.contains('active')).toBe(false);
    });

    it("shows the current tab's name on the dropdown toggle", () => {
        showTab('stats');
        expect(document.getElementById('tabs-toggle-label')?.textContent).toBe('Stats');
    });

    it('opens and closes the menu when the toggle is clicked', () => {
        toggle().click();
        expect(isOpen()).toBe(true);
        expect(toggle().getAttribute('aria-expanded')).toBe('true');
        toggle().click();
        expect(isOpen()).toBe(false);
        expect(toggle().getAttribute('aria-expanded')).toBe('false');
    });

    it('closes the menu when a tab is picked', () => {
        toggle().click();
        tabButton('stats').click();
        expect(isOpen()).toBe(false);
        expect(document.getElementById('tabs-toggle-label')?.textContent).toBe('Stats');
    });

    it('closes the menu on a click outside it, even one stopped before it reaches the document', () => {
        const elsewhere = document.getElementById('elsewhere') as HTMLElement;
        elsewhere.addEventListener('click', (event) => event.stopPropagation(), { once: true });
        toggle().click();
        elsewhere.click();
        expect(isOpen()).toBe(false);
    });

    it('closes the menu when Escape is pressed', () => {
        toggle().click();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(isOpen()).toBe(false);
    });
});
