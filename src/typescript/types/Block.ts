import type { SpecialBlockType } from './SpecialBlockType';

/**
 * Defines the Block type: a single space on a board.
 */

/**
 * A single space on a board. Plain data (no methods), so it can be saved as JSON and given to the UI as read-only.
 * - A regular block has a color and no special type
 * - A special block has a special type and no color
 * - An empty space has neither
 */
export type Block = {
    /** The block's color, or null for a special block or an empty space */
    color: string | null;
    /** The kind of special block, if this is one */
    special?: SpecialBlockType;
};
