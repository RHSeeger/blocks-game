/**
 * Fixed values describing a board: its size, the colors blocks can be, and the minimum group size for a valid move.
 */

/** Number of columns on a board */
export const BOARD_WIDTH = 10;

/** Number of rows on a board */
export const BOARD_HEIGHT = 10;

/** Total number of spaces on a board */
export const BOARD_SIZE = BOARD_WIDTH * BOARD_HEIGHT;

/** The colors a regular block can be */
export const BLOCK_COLORS: readonly string[] = ['red', 'green', 'blue', 'yellow', 'orange'];

/** A valid move needs a group of at least this many connected blocks of the same color */
export const MIN_GROUP_SIZE = 2;
