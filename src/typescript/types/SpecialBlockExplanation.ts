/**
 * Defines the SpecialBlockExplanation type: what the pop-up explaining a newly unlocked special block shows.
 */

/**
 * What the pop-up explaining a special block shows: a title, one or more pictures, and the explanation.
 *
 * Each picture is a small example board, written as rows of space-separated cells (see ui/MiniBoard.ts):
 * `R` `G` `B` `Y` `O` for a block of that color, `.` for an empty space, `+1` `H` `V` `*` `F` for a +1, horizontal
 * line, vertical line, bomb or refill block, and a `!` after a cell to show it selected.
 */
export type SpecialBlockExplanation = {
    /** The pop-up's title */
    title: string;
    /** The pictures, shown left to right with an arrow between them */
    pictures: readonly (readonly string[])[];
    /** The explanation, as paragraphs */
    paragraphs: readonly string[];
};
