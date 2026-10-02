import {
    onBlockClicked,
    onDeselect,
    onNextBoardClicked,
    onResetGameClicked,
    onResetHumanBoardClicked,
} from '../bridge/uiToLogic';
import { getElement } from './getElement';

/**
 * Sets up the UI's event handlers. Called once at startup; the handlers are never re-attached, so drawing the game
 * (which happens on every state change) never adds more listeners.
 */

/**
 * Sets up all of the UI's event handlers.
 */
export function initializeUi(): void {
    setUpTabs();
    setUpHumanBoard();
    setUpSettings();
}

/**
 * Makes the tab buttons switch which tab is shown.
 */
function setUpTabs(): void {
    const tabButtons = document.querySelectorAll<HTMLElement>('.tab-button');
    const tabContents = document.querySelectorAll<HTMLElement>('.tab-content');
    tabButtons.forEach((button) => {
        button.addEventListener('click', () => showTab(button.dataset.tab ?? 'main', tabButtons, tabContents));
    });
}

/**
 * Shows one tab and hides the others.
 *
 * @param tab - The name of the tab to show (its button's `data-tab` value)
 * @param tabButtons - All the tab buttons
 * @param tabContents - All the tab content sections
 */
function showTab(tab: string, tabButtons: NodeListOf<HTMLElement>, tabContents: NodeListOf<HTMLElement>): void {
    tabButtons.forEach((button) => button.classList.toggle('active', button.dataset.tab === tab));
    tabContents.forEach((content) => content.classList.toggle('active', content.id === `${tab}-tab`));
}

/**
 * Handles clicks on the human player's board, clicks away from it (to deselect), and the Next Board button.
 */
function setUpHumanBoard(): void {
    const board = getElement('human-board');
    board.addEventListener('click', (event) => {
        const blockElement = (event.target as HTMLElement).closest<HTMLElement>('.block');
        if (blockElement?.dataset.index !== undefined) {
            event.stopPropagation();
            onBlockClicked(Number(blockElement.dataset.index));
        }
    });
    document.addEventListener('click', () => {
        if (board.querySelector('.block.selected') !== null) {
            onDeselect();
        }
    });
    getElement('next-board-btn').addEventListener('click', (event) => {
        event.stopPropagation();
        onNextBoardClicked();
    });
}

/**
 * Handles the buttons on the Settings tab.
 */
function setUpSettings(): void {
    const resetWarning = getElement('reset-warning');
    getElement('reset-game-btn').addEventListener('click', () => {
        resetWarning.style.display = 'block';
    });
    getElement('cancel-reset-btn').addEventListener('click', () => {
        resetWarning.style.display = 'none';
    });
    getElement('confirm-reset-btn').addEventListener('click', () => {
        resetWarning.style.display = 'none';
        onResetGameClicked();
        showTab(
            'main',
            document.querySelectorAll<HTMLElement>('.tab-button'),
            document.querySelectorAll<HTMLElement>('.tab-content'),
        );
    });
    getElement('reset-human-board-btn').addEventListener('click', () => {
        onResetHumanBoardClicked();
    });
}
