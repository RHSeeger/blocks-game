/**
 * Defines the kinds of special block that can appear on a board.
 */

/**
 * The kinds of special block. A special block modifies what happens when a group it touches is removed.
 * - `plus1`: also removes every block touching the group
 */
export type SpecialBlockType = 'plus1';
