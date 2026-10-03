import { renderIntro, setUpIntro } from '../../src/typescript/ui/IntroComponent';
import { onIntroClosed, onShowIntroClicked } from '../../src/typescript/bridge/uiToLogic';

/**
 * Tests for the introduction pop-up: it's shown until it has been seen, and its buttons report to the bridge (mocked
 * here).
 */

jest.mock('../../src/typescript/bridge/uiToLogic');

const intro = () => document.getElementById('intro') as HTMLElement;

describe('introduction pop-up', () => {
    beforeAll(() => {
        // The listeners are added once, as at startup
        document.body.innerHTML = `
            <div id="intro" hidden><button id="intro-close">Let's play!</button></div>
            <button id="show-intro-btn">Show the introduction</button>`;
        setUpIntro();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        renderIntro(true);
    });

    it('is shown when the introduction has not been seen, with its button focused', () => {
        renderIntro(false);
        expect(intro().hidden).toBe(false);
        expect(document.activeElement?.id).toBe('intro-close');
    });

    it('is hidden once the introduction has been seen', () => {
        renderIntro(false);
        renderIntro(true);
        expect(intro().hidden).toBe(true);
    });

    it('reports closing it, by its button or by Escape', () => {
        renderIntro(false);
        (document.getElementById('intro-close') as HTMLElement).click();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(onIntroClosed).toHaveBeenCalledTimes(2);
    });

    it('ignores Escape while it is hidden', () => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(onIntroClosed).not.toHaveBeenCalled();
    });

    it("reports the How to Play tab's button asking to see it again", () => {
        (document.getElementById('show-intro-btn') as HTMLElement).click();
        expect(onShowIntroClicked).toHaveBeenCalled();
    });
});
