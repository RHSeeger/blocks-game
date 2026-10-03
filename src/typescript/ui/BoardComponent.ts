import type { Block } from '../types/Block';
import type { DeepReadonly } from '../types/DeepReadonly';
import type { ReadonlyPlayerState } from '../types/ReadonlyPlayerState';
import type { SpecialBlockType } from '../types/SpecialBlockType';

/**
 * Draws a player's board.
 */

/** The text shown on each kind of special block. Line blocks have none: styles.css draws a bar in their direction */
const SPECIAL_BLOCK_LABELS: Record<SpecialBlockType, string> = {
    plus1: '+1',
    lineHorizontal: '',
    lineVertical: '',
};

/**
 * Draws a player's board: one element per space, with the selected blocks highlighted. The grid's size comes from the
 * board (the `--board-columns` and `--board-rows` CSS variables).
 * Each block element has a `data-index` attribute holding its index on the board.
 *
 * The block elements are created the first time, then updated in place. Replacing them on every redraw (which happens
 * every computer turn) could swallow a click that lands while the elements are being swapped.
 *
 * @param boardElement - The element to draw the board into
 * @param playerState - The player's state (read-only)
 */
export function renderBoard(boardElement: HTMLElement, playerState: ReadonlyPlayerState): void {
    const { width, height, blocks } = playerState.board;
    boardElement.style.setProperty('--board-columns', String(width));
    boardElement.style.setProperty('--board-rows', String(height));
    if (boardElement.children.length !== blocks.length) {
        boardElement.replaceChildren(...blocks.map(() => document.createElement('div')));
    }
    const selected = new Set(playerState.selectedIndices);
    blocks.forEach((block, index) => {
        updateBlockElement(boardElement.children[index] as HTMLElement, block, index, selected.has(index));
    });
}

/**
 * Updates the element for a single space on the board to match its block.
 *
 * @param element - The element to update
 * @param block - The block in this space (read-only)
 * @param index - The block's index on the board
 * @param isSelected - Whether the block is part of the current selection
 */
function updateBlockElement(
    element: HTMLElement,
    block: DeepReadonly<Block>,
    index: number,
    isSelected: boolean,
): void {
    element.className = 'block';
    element.dataset.index = String(index);
    element.textContent = block.special !== undefined ? SPECIAL_BLOCK_LABELS[block.special] : '';
    element.style.removeProperty('--block-color');
    delete element.dataset.color;
    delete element.dataset.special;
    if (block.special !== undefined) {
        element.classList.add('special');
        element.dataset.special = block.special;
    } else if (block.color === null) {
        element.classList.add('empty');
    } else {
        // styles.css picks the shade for each color by `data-color`; `--block-color` is the fallback for a color it
        // has no shade for
        element.dataset.color = block.color;
        element.style.setProperty('--block-color', block.color);
    }
    element.classList.toggle('selected', isSelected);
}
