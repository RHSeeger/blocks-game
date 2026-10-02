import { blockClicked } from '../gamelogic/actions/blockClicked';
import { deselect } from '../gamelogic/actions/deselect';
import { nextBoard } from '../gamelogic/actions/nextBoard';
import { resetGame } from '../gamelogic/actions/resetGame';
import { resetHumanBoard } from '../gamelogic/actions/resetHumanBoard';

/**
 * Bridge: UI → Game Logic.
 *
 * The functions the UI calls to report what the user did. Each one passes the call to the matching game-logic entry
 * point, and contains no logic of its own. No game state is passed; game logic reads it from its own store.
 */

/**
 * The user clicked a block on the human player's board.
 *
 * @param index - The index of the clicked block
 */
export function onBlockClicked(index: number): void {
    blockClicked(index);
}

/**
 * The user clicked somewhere other than a block, while a group was selected.
 */
export function onDeselect(): void {
    deselect();
}

/**
 * The user clicked the "Next Board" button.
 */
export function onNextBoardClicked(): void {
    nextBoard();
}

/**
 * The user confirmed resetting the whole game.
 */
export function onResetGameClicked(): void {
    resetGame();
}

/**
 * The user clicked "Reset Human Player Board".
 */
export function onResetHumanBoardClicked(): void {
    resetHumanBoard();
}
