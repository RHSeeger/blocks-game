import type { Cube } from './cube';
import type { PlayerState } from './playerState';
import { updatePlayerComponent } from './ui/PlayerComponent';
// import type { GroupCollectionInfo } from './groupCollectionInfo';

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

export class BoardState {
    cubes: Cube[];

    constructor(cubes: Cube[]) {
        this.cubes = cubes;
    }

    /**
     * Shifts all non-empty cubes downward in each column to fill empty spaces, simulating gravity after blocks are cleared.
     * Used after groups of cubes are removed, ensuring the board state is updated so that all remaining cubes fall to the lowest available positions.
     * Mutates this.cubes in place.
     */
    applyGravity() {
        // Gravity down
        for (let col = 0; col < 10; col++) {
            for (let row = 9; row >= 0; row--) {
                const idx = row * 10 + col;
                if (this.cubes[idx].color === null) {
                    // Find the nearest non-empty block above
                    for (let above = row - 1; above >= 0; above--) {
                        const aboveIdx = above * 10 + col;
                        if (this.cubes[aboveIdx].color !== null) {
                            // Move both color and special property
                            this.cubes[idx].color = this.cubes[aboveIdx].color;
                            this.cubes[idx].special = this.cubes[aboveIdx].special;
                            this.cubes[aboveIdx].color = null;
                            delete this.cubes[aboveIdx].special;
                            break;
                        }
                    }
                }
            }
        }
        // Gravity left (twice for full collapse)
        for (let pass = 0; pass < 2; pass++) {
            for (let row = 0; row < 10; row++) {
                for (let col = 0; col < 10; col++) {
                    const idx = row * 10 + col;
                    if (this.cubes[idx].color === null) {
                        // Find the nearest non-empty block to the right
                        for (let right = col + 1; right < 10; right++) {
                            const rightIdx = row * 10 + right;
                            if (this.cubes[rightIdx].color !== null) {
                                // Move both color and special property
                                this.cubes[idx].color = this.cubes[rightIdx].color;
                                this.cubes[idx].special = this.cubes[rightIdx].special;
                                this.cubes[rightIdx].color = null;
                                delete this.cubes[rightIdx].special;
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
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
            if (visited.has(nIdx)) continue;
            const neighbor = cubes[nIdx];
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
                if (!cubes[nIdx].special) {
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
    const initialCubes: Cube[] = Array.from({ length: 100 }, () => ({ color: getRandomColor() }));
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
        initialCubes[idx] = { color: 'grey', special: 'plus1' };
    }
    return initialCubes;
}

/**
 * Creates and attaches a "Next Board" button to the UI, allowing the player to advance to a new board.
 *
 * @param board - The board element to attach the button to
 * @param cubesArr - The array of cubes to reset for the new board
 * @param unlockedUnlocks - Array of unlocks affecting board generation
 */
export function createNextBoardButton(
    board: HTMLElement,
    cubesArr: Cube[],
    unlockedUnlocks: { internalName: string }[],
    playerState: PlayerState,
    onBoardAdvance: (newCubes: Cube[], newBoardNumber: number) => void,
) {
    let btn = document.getElementById('next-board-btn') as HTMLButtonElement | null;
    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'next-board-btn';
        btn.textContent = 'Next Board';
        // Place button after the board, inside the human-area
        const humanArea = document.getElementById('human-area');
        if (humanArea) {
            humanArea.appendChild(btn);
        } else {
            board.parentElement?.appendChild(btn);
        }
    }
    btn.onclick = () => {
        // Generate new cubes using getInitialCubes to ensure special block logic
        const newCubes = getInitialCubes('player', unlockedUnlocks);
        for (let i = 0; i < cubesArr.length; i++) {
            cubesArr[i].color = newCubes[i].color;
            cubesArr[i].special = newCubes[i].special;
        }
        board.classList.remove('inactive');
        btn.remove();
        onBoardAdvance(newCubes, playerState.boardNumber + 1);
        // Use PlayerComponent to update the UI after advancing the board
        updatePlayerComponent(board, cubesArr, playerState);
    };
}

/**
 * Renders the game board in the DOM, sets up event handlers, and manages selection and group removal logic.
 *
 * @param board - The board element to render into
 * @param cubesArr - The array of cubes representing the board state
 * @param playerHealthOverride - Optional override for player health display
 * @param unlockedUnlocks - Array of unlocks affecting board behavior
 */

// The renderBoard function is now deprecated and split into UI components.
// Use updateBoard (BoardComponent) and updatePlayerComponent (PlayerComponent) for UI updates.

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
