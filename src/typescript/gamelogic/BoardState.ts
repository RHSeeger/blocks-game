// BoardState.ts
// -------------
// Implements the BoardState class, which represents the state and logic for a single game board,
// including all cubes and board operations.
//
import { Cube } from './Cube';

/**
 * Represents the cubes on a board
 */
import type { BoardStateView } from '../bridge/BoardStateView';
export class BoardState implements BoardStateView {
    cubes: Cube[];

    constructor(cubes: Cube[]) {
        this.cubes = cubes;
    }

    /**
     * Determines if the board is finished (no more removable groups remain).
     * Implements BoardStateView.isBoardFinished.
     */
    isBoardFinished(): boolean {
        for (let i = 0; i < this.cubes.length; i++) {
            if (this.cubes[i].color === null) continue;
            const connected = getConnectedIndices(i, this.cubes);
            if (connected.length > 1) {
                return false; // Found a removable group
            }
        }
        return true; // No removable groups found
    }

    /**
     * Shifts all non-empty cubes downward in each column to fill empty spaces, simulating gravity after blocks are cleared.
     * Used after groups of cubes are removed, ensuring the board state is updated so that all remaining cubes fall to the lowest available positions.
     * Mutates this.cubes in place.
     */
    applyGravity() {
        // Step 1: Gravity down (preserve order in each column)
        for (let col = 0; col < 10; col++) {
            const stack: { color: string | null; special?: 'plus1' }[] = [];
            for (let row = 0; row < 10; row++) {
                const idx = row * 10 + col;
                if (this.cubes[idx].color !== null) {
                    stack.push({ color: this.cubes[idx].color, special: this.cubes[idx].special });
                }
            }
            for (let row = 9; row >= 0; row--) {
                const idx = row * 10 + col;
                if (stack.length > 0) {
                    const cube = stack.pop()!;
                    this.cubes[idx].color = cube.color;
                    if (cube.special) {
                        this.cubes[idx].special = cube.special;
                    } else {
                        delete this.cubes[idx].special;
                    }
                } else {
                    this.cubes[idx].color = null;
                    delete this.cubes[idx].special;
                }
            }
        }

        // Step 2: Gravity left (preserve order in each row)
        for (let row = 0; row < 10; row++) {
            const nonNullCubes: { color: string | null; special?: 'plus1' }[] = [];
            for (let col = 0; col < 10; col++) {
                const idx = row * 10 + col;
                if (this.cubes[idx].color !== null) {
                    nonNullCubes.push({ color: this.cubes[idx].color, special: this.cubes[idx].special });
                }
            }
            for (let col = 0; col < 10; col++) {
                const idx = row * 10 + col;
                if (col < nonNullCubes.length) {
                    this.cubes[idx].color = nonNullCubes[col].color;
                    if (nonNullCubes[col].special) {
                        this.cubes[idx].special = nonNullCubes[col].special;
                    } else {
                        delete this.cubes[idx].special;
                    }
                } else {
                    this.cubes[idx].color = null;
                    delete this.cubes[idx].special;
                }
            }
        }

        // Step 3: Gravity down again (preserve order in each column)
        for (let col = 0; col < 10; col++) {
            const stack: { color: string | null; special?: 'plus1' }[] = [];
            for (let row = 0; row < 10; row++) {
                const idx = row * 10 + col;
                if (this.cubes[idx].color !== null) {
                    stack.push({ color: this.cubes[idx].color, special: this.cubes[idx].special });
                }
            }
            for (let row = 9; row >= 0; row--) {
                const idx = row * 10 + col;
                if (stack.length > 0) {
                    const cube = stack.pop()!;
                    this.cubes[idx].color = cube.color;
                    if (cube.special) {
                        this.cubes[idx].special = cube.special;
                    } else {
                        delete this.cubes[idx].special;
                    }
                } else {
                    this.cubes[idx].color = null;
                    delete this.cubes[idx].special;
                }
            }
        }
    }
}

/**
 * Returns the indices of all non-special cubes connected to the start index, NOT including any special blocks (even if adjacent).
 * Does NOT perform +1 block expansion logic. Used to determine the group before special block effects are applied.
 * This is needed for correct group selection logic, so that a group is only valid if it contains at least two non-special blocks before any special expansion.
 *
 * @param startIdx The index of the starting cube
 * @param cubes The array of cubes representing the board
 * @returns Array of indices of non-special cubes in the group before special expansion
 */
export function getConnectedIndicesBeforeSpecial(startIdx: number, cubes: Cube[]): number[] {
    // Explicit return type already present
    const targetColor = cubes[startIdx].color;
    if (!targetColor) return [];
    const visited = new Set<number>();
    const toVisit = [startIdx];
    while (toVisit.length > 0) {
        const idx = toVisit.pop()!;
        if (visited.has(idx)) continue;
        visited.add(idx);
        const row = Math.floor(idx / 10);
        const col = idx % 10;
        const neighbors: number[] = [];
        if (row > 0) neighbors.push(idx - 10);
        if (row < 9) neighbors.push(idx + 10);
        if (col > 0) neighbors.push(idx - 1);
        if (col < 9) neighbors.push(idx + 1);
        for (const nIdx of neighbors) {
            if (visited.has(nIdx)) continue;
            const neighbor = cubes[nIdx];
            if (neighbor.special) {
                visited.add(nIdx);
                continue;
            }
            if (neighbor.color === targetColor) {
                toVisit.push(nIdx);
            }
        }
    }
    // Only return indices of non-special cubes
    return Array.from(visited).filter((idx) => !cubes[idx].special);
}

/**
 * Returns the indices of all cubes connected to the starting index, including special blocks (but does not traverse from them).
 *
 * This function is used to determine the group of blocks that would be cleared if the user clicks a block.
 * It first finds all adjacent blocks of the same color (including special blocks, but does not traverse from them).
 * If the group contains a '+1' special block, the group is expanded to include all blocks adjacent to any non-special block in the group.
 *
 * The group is only valid if it contains at least two non-special blocks. Otherwise, an empty array is returned.
 *
 * @param startIdx - The index of the starting cube
 * @param cubes - The array of cubes representing the board
 * @returns An array of indices representing the connected group, or an empty array if the group is not valid
 */
export function getConnectedIndices(startIdx: number, cubes: Cube[]): number[] {
    const targetColor = cubes[startIdx].color;
    if (!targetColor) return [];
    const visited = new Set<number>();
    const toVisit = [startIdx];

    // Step 1: Find initial group (normal color logic, include special blocks but don't traverse from them)
    while (toVisit.length > 0) {
        const idx = toVisit.pop()!;
        if (visited.has(idx)) continue;
        visited.add(idx);

        const row = Math.floor(idx / 10);
        const col = idx % 10;

        // Check neighbors: up, down, left, right
        const neighbors: number[] = [];
        if (row > 0) neighbors.push(idx - 10); // up
        if (row < 9) neighbors.push(idx + 10); // down
        if (col > 0) neighbors.push(idx - 1); // left
        if (col < 9) neighbors.push(idx + 1); // right

        for (const nIdx of neighbors) {
            if (nIdx < 0 || nIdx >= cubes.length) continue;
            if (visited.has(nIdx)) continue;
            const neighbor = cubes[nIdx];
            if (!neighbor) continue;
            if (neighbor.special) {
                // Include special block, but do not traverse further from it
                visited.add(nIdx);
                continue;
            }
            if (neighbor.color === targetColor) {
                toVisit.push(nIdx);
            }
        }
    }

    // Step 2: If group contains a +1 block, expand group by including all blocks adjacent to non-special blocks in the group
    const groupIndices = Array.from(visited);
    const hasPlus1 = groupIndices.some((idx) => cubes[idx].special === 'plus1');
    if (hasPlus1) {
        const expanded = new Set<number>(groupIndices);
        for (const idx of groupIndices) {
            if (cubes[idx].special) continue; // Only expand from non-special blocks
            const row = Math.floor(idx / 10);
            const col = idx % 10;
            const neighbors: number[] = [];
            if (row > 0) neighbors.push(idx - 10);
            if (row < 9) neighbors.push(idx + 10);
            if (col > 0) neighbors.push(idx - 1);
            if (col < 9) neighbors.push(idx + 1);
            for (const nIdx of neighbors) {
                if (nIdx < 0 || nIdx >= cubes.length) continue;
                const neighbor = cubes[nIdx];
                if (!neighbor) continue;
                // Only add if not special AND not empty
                if (!neighbor.special && neighbor.color !== null) {
                    expanded.add(nIdx);
                }
            }
        }
        // Prevent selection if only one non-special block
        const nonSpecialCount = Array.from(expanded).filter((idx) => !cubes[idx].special).length;
        if (nonSpecialCount < 2) return [];
        return Array.from(expanded);
    }

    // Prevent selection if only one non-special block (no +1 block)
    const nonSpecialCount = groupIndices.filter((idx) => !cubes[idx].special).length;
    if (nonSpecialCount < 2) return [];
    return groupIndices;
}

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
 * @param size - The number of non-special blocks in the group
 * @returns The score awarded for clearing the group
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

/**
 * Generates the initial cubes for a new board, optionally including special blocks if unlocked.
 *
 * @param boardType - 'player' or 'computer', determines if special blocks are allowed
 * @param unlockedUnlocks - Array of unlocks that may affect board generation
 * @returns An array of Cube objects representing the initial board state
 */
export function getInitialCubes(
    boardType: 'player' | 'computer' = 'player',
    unlockedUnlocks: { internalName: string }[] = [],
): Cube[] {
    let allowPlus1 = false;
    if (boardType === 'player') {
        allowPlus1 = unlockedUnlocks.some((u) => u.internalName === 'plus1Bricks');
    }
    const initialCubes: Cube[] = Array.from({ length: 100 }, () => new Cube(getRandomColor()));
    if (boardType === 'player' && allowPlus1) {
        const nonEdgeIndices = [];
        for (let i = 0; i < 100; i++) {
            if (i > 9 && i < 90 && i % 10 !== 0 && i % 10 !== 9) nonEdgeIndices.push(i);
        }
        let idx: number;
        if (nonEdgeIndices.length > 0) {
            idx = nonEdgeIndices[Math.floor(Math.random() * nonEdgeIndices.length)];
        } else {
            idx = Math.floor(Math.random() * 100);
        }
        initialCubes[idx] = new Cube('grey', 'plus1');
    }
    return initialCubes;
}

/**
 * Returns a random color string from the available cube colors.
 *
 * @returns A color string
 */
function getRandomColor(): string {
    const colors = ['red', 'green', 'blue', 'yellow', 'orange'];
    return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Determines if the board is finished (no more removable groups remain).
 *
 * @param cubes - The array of cubes representing the board
 * @returns True if no removable groups remain, false otherwise
 */
export function isBoardFinished(cubes: Cube[]): boolean {
    for (let i = 0; i < cubes.length; i++) {
        if (cubes[i].color === null) continue;
        const connected = getConnectedIndices(i, cubes);
        if (connected.length > 1) {
            return false; // Found a removable group
        }
    }
    return true; // No removable groups found
}
