import { onSpecialBlockExplanationClosed } from '../bridge/uiToLogic';
import { getElement } from './getElement';
import { createMiniBoard } from './MiniBoard';
import { SPECIAL_BLOCK_EXPLANATIONS } from './specialBlockExplanations';

/**
 * The pop-up explaining a special block the human player has just unlocked, with pictures. It stays until closed.
 *
 * Game logic works out which special block to explain (DerivedGameInfo.specialBlockToExplain), so it's remembered
 * across reloads and shown one at a time; closing it tells game logic through the bridge. Like the introduction, it
 * only closes from its own button (or Escape).
 */

/**
 * Sets up the pop-up's close button and Escape. Called once at startup.
 */
export function setUpSpecialBlockPopup(): void {
    const close = () => {
        const augmentation = getElement('special-block-popup').dataset.augmentation;
        if (augmentation !== undefined) onSpecialBlockExplanationClosed(augmentation);
    };
    getElement('special-block-close').addEventListener('click', close);
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !getElement('special-block-popup').hidden) close();
    });
}

/**
 * Shows the explanation of a special block, or hides the pop-up when there's nothing to explain. The content is only
 * rebuilt when a different special block is shown, so redrawing (every computer turn) doesn't disturb it.
 *
 * @param augmentation - The special block Augmentation to explain (its internalName), or undefined for none
 */
export function renderSpecialBlockPopup(augmentation: string | undefined): void {
    const popup = getElement('special-block-popup');
    const explanation = augmentation === undefined ? undefined : SPECIAL_BLOCK_EXPLANATIONS[augmentation];
    if (augmentation === undefined || explanation === undefined) {
        popup.hidden = true;
        delete popup.dataset.augmentation;
        return;
    }
    if (popup.dataset.augmentation === augmentation && !popup.hidden) return;

    popup.dataset.augmentation = augmentation;
    getElement('special-block-title').textContent = explanation.title;
    const pictures = explanation.pictures.flatMap((rows, i) => {
        const arrow = document.createElement('span');
        arrow.className = 'special-block-arrow';
        arrow.setAttribute('aria-hidden', 'true');
        arrow.textContent = '→';
        return i === 0 ? [createMiniBoard(rows)] : [arrow, createMiniBoard(rows)];
    });
    getElement('special-block-pictures').replaceChildren(...pictures);
    getElement('special-block-text').replaceChildren(
        ...explanation.paragraphs.map((text) => {
            const paragraph = document.createElement('p');
            paragraph.textContent = text;
            return paragraph;
        }),
    );
    popup.hidden = false;
    getElement('special-block-close').focus({ preventScroll: true });
}
