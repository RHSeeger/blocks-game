import type { SpecialBlockType } from '../types/SpecialBlockType';

/**
 * Builds small example boards for pop-ups, out of the game's own block styles.
 */

/** The block color for each letter used in a picture */
const COLORS: Readonly<Record<string, string>> = { R: 'red', G: 'green', B: 'blue', Y: 'yellow', O: 'orange' };

/** The special block for each code used in a picture */
const SPECIALS: Readonly<Record<string, SpecialBlockType>> = {
    '+1': 'plus1',
    '+2': 'plus2',
    H: 'lineHorizontal',
    V: 'lineVertical',
    '*': 'bomb',
    '**': 'bigBomb',
    F: 'refill',
    C: 'colorBlast',
};

/**
 * Builds a small example board from a picture: rows of space-separated cells. A cell is `R` `G` `B` `Y` `O` (a block
 * of that color), `.` (an empty space), or `+1` `+2` `H` `V` `*` `**` `F` `C` (a +1, +2, horizontal line, vertical
 * line, bomb, big bomb, refill or Color Blast block), with a `!` after it to show it selected. Unknown cells are drawn
 * as empty spaces.
 *
 * @param rows - The picture's rows (each should have the same number of cells)
 * @returns The board element (a `.mini-board`)
 */
export function createMiniBoard(rows: readonly string[]): HTMLElement {
    const cells = rows.map((row) => row.trim().split(/\s+/));
    const board = document.createElement('div');
    board.className = 'mini-board';
    board.setAttribute('aria-hidden', 'true');
    board.style.setProperty('--cols', String(cells[0]?.length ?? 0));
    board.append(...cells.flat().map(createCell));
    return board;
}

/**
 * Builds one cell of an example board.
 *
 * @param code - The cell's code (see createMiniBoard)
 * @returns The block element
 */
function createCell(code: string): HTMLElement {
    const selected = code.endsWith('!');
    const kind = selected ? code.slice(0, -1) : code;
    const block = document.createElement('span');
    block.className = 'block';
    const special = SPECIALS[kind];
    const color = COLORS[kind];
    if (special !== undefined) {
        block.classList.add('special');
        block.dataset.special = special;
        if (special === 'plus1') block.textContent = '+1';
        if (special === 'plus2') block.textContent = '+2';
    } else if (color !== undefined) {
        block.dataset.color = color;
    } else {
        block.classList.add('empty');
    }
    block.classList.toggle('selected', selected);
    return block;
}
