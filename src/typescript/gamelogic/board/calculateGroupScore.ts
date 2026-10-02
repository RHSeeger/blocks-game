/**
 * Calculates the score for removing a group of blocks.
 */

/**
 * Calculates the score for a group of a given size, using a progressive bonus system.
 * Every time the number of blocks in the group doubles, the per-block bonus increases by 1.
 * So the scores would look like
 * - Size 1: 1 point
 * - Size 2: 3 points (1 + 2) (doubled at 2)
 * - Size 3: 5 points (1 + 2 + 2) (doubled at 2)
 * - Size 4: 8 points (1 + 2 + 2 + 3) (doubled at 2, then again at 4)
 * - Size 5: 11 points (1 + 2 + 2 + 3 + 3) (doubled at 2, then again at 4)
 * - Size 6: 14 points (1 + 2 + 2 + 3 + 3 + 3) (doubled at 2, then again at 4)
 * - Size 8: 21 points (1 + 2 + 2 + 3 + 3 + 3 + 3 + 4) (doubled at 2, then again at 4, then again at 8)
 *
 * @param size - The number of regular (non-special) blocks removed
 * @returns The score awarded for removing the group
 */
export function calculateGroupScore(size: number): number {
    let score = 0;
    let threshold = 1;
    let bonus = 1;
    for (let i = 1; i <= size; i++) {
        if (i === threshold * 2) {
            threshold *= 2;
            bonus++;
        }
        score += bonus;
    }
    return score;
}
