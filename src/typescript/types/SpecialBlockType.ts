/**
 * Defines the kinds of special block that can appear on a board.
 */

/**
 * The kinds of special block. A special block goes off when a move's area reaches or touches it (see getMoveAt), and
 * each kind adds to the area in its own way:
 * - `plus1`: the move reaches 1 space further out from the group (each +1 adds 1)
 * - `lineHorizontal`: every block in the special block's row, from the left edge to the right
 * - `lineVertical`: every block in the special block's column, from the top to the bottom
 * - `plus2`: like `plus1`, but the move reaches 2 spaces further (a +1 that came out bigger; see SpecialBlockSpawn)
 * - `bomb`: every block in the square around the special block (BOMB_RADIUS spaces out, so 3x3 for a radius of 1)
 * - `bigBomb`: like `bomb`, but a bigger square (BIG_BOMB_RADIUS spaces out, so 5x5)
 * - `refill`: adds nothing to the area. Instead, once the board has settled, every empty space is filled with a new
 *   block (see refillBoard)
 * - `colorBlast`: every block on the board of the same color as the move's group
 */
export type SpecialBlockType =
    | 'plus1'
    | 'plus2'
    | 'lineHorizontal'
    | 'lineVertical'
    | 'bomb'
    | 'bigBomb'
    | 'refill'
    | 'colorBlast';
