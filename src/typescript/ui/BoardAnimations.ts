import type { GameNotification } from '../types/GameNotification';
import { getElement } from './getElement';

/**
 * Shows a move on the board as it happens: the removed blocks shrink away, the blocks that moved slide from their old
 * spaces into their new ones, and the score the move earned floats up from the block that was clicked.
 *
 * Game logic describes each move in a `blocksRemoved` notification. Showing it takes two steps around the redraw:
 * 1. Before the board is redrawn (it still shows the blocks being removed), copies ("ghosts") of the removed blocks
 *    are made, on top of the board, and shrink away
 * 2. After it is redrawn, each block that moved starts at its old space and slides into its new one, any new blocks
 *    from a refill drop in from above the board, and the score floats up
 *
 * The ghosts and the score are put in the board's frame, not the board itself, so the board's grid only ever holds
 * one element per space. Positions use offsetLeft/offsetTop, which ignore any slide still running from the last move.
 * Nothing is shown for a board that isn't on screen (another tab, or the other board on a phone). When the device asks
 * for reduced motion, only the score is shown (fading, without moving).
 */

/** How long a removed block takes to shrink away */
const REMOVE_MS = 200;

/** How long the remaining blocks take to slide into place, and how long they wait for the removed ones to shrink */
const SETTLE_MS = 260;
const SETTLE_DELAY_MS = 120;

/** How long new blocks from a refill take to drop in (they start once the others have settled) */
const DROP_MS = 320;

/** How long the score takes to float up and fade, and how far it floats */
const SCORE_MS = 900;
const SCORE_RISE_PX = 28;

/** A move scoring at least this much shows its score bigger (a group of about 15 blocks, or a big +1 or line move) */
const BIG_SCORE = 50;

/** A move being shown: what's left to do once the board has been redrawn */
type FinishAnimation = () => void;

/**
 * Starts showing every move in the notifications. Call this before the boards are redrawn, then call each function it
 * returns after they are redrawn.
 *
 * @param notifications - The notifications sent with the game state (only `blocksRemoved` ones are used)
 * @returns One function per move, to call once the boards have been redrawn
 */
export function startMoveAnimations(notifications: readonly GameNotification[]): FinishAnimation[] {
    return notifications.flatMap((notification) =>
        notification.kind === 'blocksRemoved'
            ? [startMoveAnimation(getElement(`${notification.player}-board`), notification)]
            : [],
    );
}

/**
 * Starts showing one move: makes the ghosts of the removed blocks (while the board still shows them).
 *
 * @param boardElement - The board the move was made on
 * @param move - The move
 * @returns What to do once the board has been redrawn: slide the moved blocks into place and show the score
 */
function startMoveAnimation(
    boardElement: HTMLElement,
    move: Extract<GameNotification, { kind: 'blocksRemoved' }>,
): FinishAnimation {
    const frame = boardElement.parentElement;
    if (frame === null || !isOnScreen(boardElement) || !canAnimate(boardElement)) return () => undefined;
    const cells = boardElement.children;
    const reducedMotion = prefersReducedMotion();
    if (!reducedMotion) {
        move.removed.forEach((index) => shrinkAway(frame, cells[index] as HTMLElement | undefined));
    }
    return () => {
        if (!reducedMotion) {
            move.cameFrom.forEach((from, index) =>
                slideIn(cells[index] as HTMLElement | undefined, cells[from] as HTMLElement | undefined),
            );
            move.added.forEach((index) => dropIn(cells[index] as HTMLElement | undefined));
        }
        if (move.score > 0) {
            floatScore(frame, cells[move.clicked] as HTMLElement | undefined, move.score, reducedMotion);
        }
    };
}

/**
 * Puts a copy of a block on top of it, in the board's frame, and shrinks it away.
 *
 * @param frame - The board's frame
 * @param cell - The block's element (nothing is done if it doesn't exist)
 */
function shrinkAway(frame: HTMLElement, cell: HTMLElement | undefined): void {
    if (cell === undefined) return;
    const ghost = cell.cloneNode(true) as HTMLElement;
    ghost.classList.add('block-ghost');
    ghost.removeAttribute('data-index');
    placeOver(ghost, cell);
    frame.append(ghost);
    const animation = ghost.animate(
        [
            { transform: 'scale(1)', opacity: 1 },
            { transform: 'scale(0.2)', opacity: 0 },
        ],
        { duration: REMOVE_MS, easing: 'ease-in', fill: 'forwards' },
    );
    animation.onfinish = () => ghost.remove();
}

/**
 * Makes a block that moved start at its old space and slide into its new one.
 *
 * @param cell - The element of the space the block is in now
 * @param oldCell - The element of the space it was in before the move (nothing is done if there isn't one, or it is
 *   the same space)
 */
function slideIn(cell: HTMLElement | undefined, oldCell: HTMLElement | undefined): void {
    if (cell === undefined || oldCell === undefined || cell === oldCell) return;
    const dx = oldCell.offsetLeft - cell.offsetLeft;
    const dy = oldCell.offsetTop - cell.offsetTop;
    cell.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }], {
        duration: SETTLE_MS,
        delay: SETTLE_DELAY_MS,
        easing: 'cubic-bezier(0.3, 0, 0.3, 1)',
        fill: 'backwards',
    });
}

/**
 * Makes a new block (from a refill) drop in from above the board, once the other blocks have slid into place. The
 * board's frame hides anything above it, so the block appears to fall in from its top edge.
 *
 * @param cell - The element of the space the new block is in (nothing is done if it doesn't exist)
 */
function dropIn(cell: HTMLElement | undefined): void {
    if (cell === undefined) return;
    const fallFrom = cell.offsetTop + cell.offsetHeight;
    cell.animate(
        [
            { transform: `translateY(-${fallFrom}px)`, opacity: 0 },
            { transform: 'translateY(0)', opacity: 1 },
        ],
        {
            duration: DROP_MS,
            delay: SETTLE_DELAY_MS + SETTLE_MS,
            easing: 'cubic-bezier(0.5, 0, 0.75, 0)',
            fill: 'backwards',
        },
    );
}

/**
 * Shows the score a move earned, over the block that was clicked, floating up and fading away.
 *
 * @param frame - The board's frame
 * @param cell - The element of the block that was clicked (nothing is shown if it doesn't exist)
 * @param score - The score
 * @param reducedMotion - If true, the score fades without moving
 */
function floatScore(frame: HTMLElement, cell: HTMLElement | undefined, score: number, reducedMotion: boolean): void {
    if (cell === undefined) return;
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.classList.toggle('big', score >= BIG_SCORE);
    popup.textContent = `+${score}`;
    // Centered on the clicked block, but low enough that floating up keeps it inside the frame
    popup.style.left = `${cell.offsetLeft + cell.offsetWidth / 2}px`;
    popup.style.top = `${Math.max(cell.offsetTop + cell.offsetHeight / 2, SCORE_RISE_PX + 12)}px`;
    frame.append(popup);
    const rise = reducedMotion ? 0 : SCORE_RISE_PX;
    const animation = popup.animate(
        [
            { transform: 'translate(-50%, -50%) scale(0.8)', opacity: 0 },
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 1, offset: 0.15 },
            { transform: `translate(-50%, calc(-50% - ${rise}px)) scale(1)`, opacity: 0 },
        ],
        { duration: SCORE_MS, easing: 'ease-out', fill: 'forwards' },
    );
    animation.onfinish = () => popup.remove();
}

/**
 * Sets an element's position and size to sit exactly over a block (both positioned within the board's frame).
 *
 * @param element - The element to place
 * @param cell - The block's element
 */
function placeOver(element: HTMLElement, cell: HTMLElement): void {
    // The block's styles are sized by --block-size, which is set on the board; the copy isn't inside the board
    element.style.setProperty('--block-size', `${cell.offsetWidth}px`);
    element.style.left = `${cell.offsetLeft}px`;
    element.style.top = `${cell.offsetTop}px`;
    element.style.width = `${cell.offsetWidth}px`;
    element.style.height = `${cell.offsetHeight}px`;
}

/**
 * Determines whether a board is on screen (not hidden by its tab, or by the phone's "You | Computer" switch).
 *
 * @param boardElement - The board
 * @returns True if it is shown
 */
function isOnScreen(boardElement: HTMLElement): boolean {
    return boardElement.getClientRects().length > 0;
}

/**
 * Determines whether the browser can run animations from code (the Web Animations API).
 *
 * @param element - Any element
 * @returns True if `element.animate` exists
 */
function canAnimate(element: HTMLElement): boolean {
    return typeof element.animate === 'function';
}

/**
 * Determines whether the device asks for less motion (an accessibility setting).
 *
 * @returns True if it does
 */
function prefersReducedMotion(): boolean {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}
