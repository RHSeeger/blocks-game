import type { PlayerId } from '../types/PlayerId';

/**
 * Fixed values about boards: the starting and largest sizes, the colors blocks can be, and the minimum group size for
 * a valid move.
 */

/**
 * The number of columns and rows on each player's first board (boards are square). Each board stores its own size;
 * the "Bigger Board" Upgrade makes later boards bigger
 */
export const STARTING_BOARD_SIZE: Readonly<Record<PlayerId, number>> = { human: 8, computer: 10 };

/**
 * The largest board each player can have, in columns and rows. The human player's board is kept small enough to tap
 * on a phone; the computer player's is only watched, so it can grow further
 */
export const LARGEST_BOARD_SIZE: Readonly<Record<PlayerId, number>> = { human: 12, computer: 20 };

/** The colors a regular block can be */
export const BLOCK_COLORS: readonly string[] = ['red', 'green', 'blue', 'yellow', 'orange'];

/** A valid move needs a group of at least this many connected blocks of the same color */
export const MIN_GROUP_SIZE = 2;
