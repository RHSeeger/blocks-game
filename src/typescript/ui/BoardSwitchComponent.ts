import type { PlayerId } from '../types/PlayerId';
import { getElement } from './getElement';

/**
 * The "You | Computer" switch on the Main tab, which picks which player's board is shown on a phone.
 *
 * On a phone (see styles.css) there's only room to show one board properly, so the switch shows one player's area at a
 * time, at full width. On wider screens the switch is hidden and both boards are always shown. Which board is picked
 * is kept on the page itself (the boards' wrapper's `data-showing` attribute), not in the game state: it's how the
 * page is being viewed, not part of the game.
 */

/**
 * Sets up the switch's buttons. Called once at startup.
 */
export function setUpBoardSwitch(): void {
    document.querySelectorAll<HTMLElement>('.board-switch-button').forEach((button) => {
        button.addEventListener('click', () => {
            const player = button.dataset.player;
            if (player === 'human' || player === 'computer') showBoard(player);
        });
    });
}

/**
 * Shows one player's board (on a phone; wider screens always show both), and marks that player's button as picked.
 *
 * @param player - The player whose board to show
 */
export function showBoard(player: PlayerId): void {
    getElement('boards-wrapper').dataset.showing = player;
    document.querySelectorAll<HTMLElement>('.board-switch-button').forEach((button) => {
        const isActive = button.dataset.player === player;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });
}
