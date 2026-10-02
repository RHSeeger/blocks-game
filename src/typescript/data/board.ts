/**
 * Fixed values about boards: the starting size, the colors blocks can be, and the minimum group size for a valid move.
 */

/** Number of columns on a new player's board. Each board stores its own size, which can change later */
export const STARTING_BOARD_WIDTH = 10;

/** Number of rows on a new player's board. Each board stores its own size, which can change later */
export const STARTING_BOARD_HEIGHT = 10;

/** The colors a regular block can be */
export const BLOCK_COLORS: readonly string[] = ['red', 'green', 'blue', 'yellow', 'orange'];

/** A valid move needs a group of at least this many connected blocks of the same color */
export const MIN_GROUP_SIZE = 2;
