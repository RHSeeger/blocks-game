import { setDebugMode, setUpDebugTools } from '../../src/typescript/ui/DebugToolsComponent';
import { onGrantAchievementClicked, onGrantCurrencyClicked } from '../../src/typescript/bridge/uiToLogic';

/**
 * Tests for the debug tools: the switch that shows them, and their buttons, which report what was clicked to the
 * bridge (mocked here).
 */

jest.mock('../../src/typescript/bridge/uiToLogic');

const toggle = () => document.getElementById('debug-tools-toggle') as HTMLElement;

describe('debug tools', () => {
    beforeAll(() => {
        // The listeners are added once, as at startup
        document.body.innerHTML = `
            <button id="debug-tools-toggle" aria-pressed="false">Show Debug Tools</button>
            <div id="debug-currency-buttons">
                <button class="debug-grant-currency" data-currency="chips" data-amount="1000">+1,000 Chips</button>
            </div>
            <div id="achievements-list">
                <button class="grant-achievement-btn" data-achievement="first_clear">Grant</button>
            </div>`;
        setUpDebugTools();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        setDebugMode(false);
    });

    it('starts hidden, and the switch shows and hides them', () => {
        expect(document.body.classList.contains('debug-mode')).toBe(false);
        toggle().click();
        expect(document.body.classList.contains('debug-mode')).toBe(true);
        expect(toggle().getAttribute('aria-pressed')).toBe('true');
        expect(toggle().textContent).toBe('Hide Debug Tools');
        toggle().click();
        expect(document.body.classList.contains('debug-mode')).toBe(false);
        expect(toggle().textContent).toBe('Show Debug Tools');
    });

    it("reports a currency button's currency and amount", () => {
        (document.querySelector('.debug-grant-currency') as HTMLElement).click();
        expect(onGrantCurrencyClicked).toHaveBeenCalledWith('chips', 1000);
    });

    it("reports a Grant button's achievement", () => {
        (document.querySelector('.grant-achievement-btn') as HTMLElement).click();
        expect(onGrantAchievementClicked).toHaveBeenCalledWith('first_clear');
    });
});
