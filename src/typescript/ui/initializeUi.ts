import {
    onBlockClicked,
    onBuyUpgradeClicked,
    onDeselect,
    onNextBoardClicked,
    onResetGameClicked,
    onResetHumanBoardClicked,
} from '../bridge/uiToLogic';
import { setUpBoardSwitch, showBoard } from './BoardSwitchComponent';
import { getElement } from './getElement';
import { setUpTabs, showTab } from './TabsComponent';

/**
 * Sets up the UI's event handlers. Called once at startup; the handlers are never re-attached, so drawing the game
 * (which happens on every state change) never adds more listeners.
 */

/**
 * Sets up all of the UI's event handlers.
 */
export function initializeUi(): void {
    setUpTabs();
    setUpBoardSwitch();
    setUpHumanBoard();
    setUpUpgrades();
    setUpSettings();
}

/**
 * Handles clicks on the Buy buttons on the Upgrades tab. One handler on the list handles every button, so redrawing
 * the list doesn't need to attach new handlers.
 */
function setUpUpgrades(): void {
    getElement('upgrades-list').addEventListener('click', (event) => {
        const button = (event.target as HTMLElement).closest<HTMLButtonElement>('.buy-upgrade-btn');
        const { upgrade, player } = button?.dataset ?? {};
        if (button === null || button.disabled || upgrade === undefined) return;
        if (player === 'human' || player === 'computer') {
            onBuyUpgradeClicked(upgrade, player);
        }
    });
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
        showTab('main');
        showBoard('human');
    });
    getElement('reset-human-board-btn').addEventListener('click', () => {
        onResetHumanBoardClicked();
    });
}
