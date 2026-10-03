import { onIntroClosed, onShowIntroClicked } from '../bridge/uiToLogic';
import { getElement } from './getElement';

/**
 * The introduction ("how to play") pop-up, shown when the game is first opened, until the player closes it.
 *
 * Whether it has been seen is part of the game state (`introSeen`), so it's remembered: closing it, or the How to Play
 * tab's "Show the introduction" button, tells game logic through the bridge, and it's drawn from the state. It only
 * closes from its own button (or Escape), not from a tap outside it, so it can't be closed by accident.
 */

/**
 * Sets up the pop-up's close button, Escape, and the How to Play tab's button to show it again. Called once at startup.
 */
export function setUpIntro(): void {
    getElement('intro-close').addEventListener('click', () => onIntroClosed());
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !getElement('intro').hidden) onIntroClosed();
    });
    getElement('show-intro-btn').addEventListener('click', () => onShowIntroClicked());
}

/**
 * Shows the pop-up if the introduction hasn't been seen, and hides it once it has. When it's first shown, its close
 * button gets the focus, so it can be closed from the keyboard straight away.
 *
 * @param introSeen - Whether the introduction has been seen (from the game state)
 */
export function renderIntro(introSeen: boolean): void {
    const intro = getElement('intro');
    const wasHidden = intro.hidden;
    intro.hidden = introSeen;
    // Without preventScroll, focusing the button (at the bottom) would scroll a tall pop-up past its start on a phone
    if (wasHidden && !introSeen) getElement('intro-close').focus({ preventScroll: true });
}
