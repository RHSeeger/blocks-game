/**
 * The values for the goals that earn Gems (other than achievements, which list their own Gems).
 */

/**
 * The board score the human player needs on a finished board to earn their first goal Gem. About what a typical 8x8
 * board with a +1 block scores (the human player's starting board size)
 */
export const GEM_GOAL_STARTING_BOARD_SCORE = 110;

/** How much the board score goal goes up each time it is reached */
export const GEM_GOAL_INCREASE = 20;

/** Gems earned each time the human player finishes a board with no blocks left */
export const SPOTLESS_GEMS = 1;

/** The computer player earns a Gem when it finishes this many boards, then double that, and so on */
export const COMPUTER_MILESTONE_FIRST_BOARD = 10;

/** Gems earned for each computer milestone */
export const COMPUTER_MILESTONE_GEMS = 1;
