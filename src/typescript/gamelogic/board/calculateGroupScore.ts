/**
 * Calculates the score for removing a group of blocks.
 */

/**
 * Calculates the score for a group of a given size: the size times itself, so bigger groups are worth much more than
 * the same blocks removed in smaller groups (one group of 10 is 100 points; five groups of 2 are 20). This is what
 * makes planning pay off, such as saving up a color to remove it in one big group.
 * - Size 2: 4 points
 * - Size 3: 9 points
 * - Size 5: 25 points
 * - Size 10: 100 points
 * - Size 20: 400 points
 *
 * @param size - The number of regular (non-special) blocks removed
 * @returns The score awarded for removing the group
 */
export function calculateGroupScore(size: number): number {
    return size * size;
}
