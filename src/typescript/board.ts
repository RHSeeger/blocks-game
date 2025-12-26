import type { Cube } from './cube';
import type { PlayerState } from './playerState';
import type { GroupCollectionInfo } from './groupCollectionInfo';
import { createGroupCollectionInfo } from './groupCollectionInfo';

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
 *
 * @param size - The number of non-special blocks in the group
 * @returns The score awarded for clearing the group
 */
export function calculateGroupScore(size: number): number {
    let score = 0;
    let threshold = 1;
    let bonus = 1;
    for (let i = 1; i <= size; i++) {
        score += bonus;
        if (i === threshold * 2) {
            threshold *= 2;
            bonus++;
        }
    }
    return score;
}

let totalScore = 0;
let boardScore = 0;
let maxBoardScore = 0;
let boardNumber = 1;
let cubes: Cube[] = [];

let onGameStateChange: ((state: PlayerState, removedGroup?: number[]) => void) | null = null;

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
 * Sets the current game state and registers a callback for state changes.
 *
 * @param state - The PlayerState to set as the current state
 * @param onChange - Callback invoked when the game state changes
 */
export function setGameState(state: PlayerState, onChange: (state: PlayerState, removedGroup?: number[]) => void) {
    cubes = state.board.cubes.map((c) => ({ ...c }));
    totalScore = state.totalScore;
    boardScore = state.boardScore;
    maxBoardScore = state.maxBoardScore;
    boardNumber = state.boardNumber;
    onGameStateChange = onChange;
    updateBoardNumberDisplay();
    updateScoreDisplayGlobal();
}

/**
 * Internal: Updates the game state and invokes the registered callback, if any.
 *
 * @param removedGroup - Optional array of indices representing the last removed group
 */
function updateGameState(removedGroup?: number[]) {
    if (onGameStateChange) {
        onGameStateChange(
            {
                board: new BoardState(cubes.map((c) => ({ ...c }))),
                totalScore,
                boardScore,
                maxBoardScore,
                boardNumber,
            },
            removedGroup,
        );
    }
}

/**
 * Returns a deep copy of the current PlayerState, including the board and scores.
 *
 * @returns The current PlayerState
 */
export function getGameState(): PlayerState {
    return {
        board: new BoardState(cubes.map((c) => ({ ...c }))),
        totalScore,
        boardScore,
        maxBoardScore,
        boardNumber,
    };
}

/**
 * Updates the global score display in the DOM for the human player.
 */
function updateScoreDisplayGlobal() {
    const scoreDisplay = document.getElementById('human-score');
    if (scoreDisplay) scoreDisplay.textContent = (typeof totalScore === 'number' ? totalScore : 0).toString();
}

/**
 * Updates the board number display in the DOM for the human player.
 */
function updateBoardNumberDisplay() {
    const boardNumDisplay = document.getElementById('human-board-number');
    if (boardNumDisplay) boardNumDisplay.textContent = boardNumber.toString();
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
        boardNumber++;
        boardScore = 0; // Reset board score for new board
        updateBoardNumberDisplay();
        renderBoard(board, cubesArr, undefined, unlockedUnlocks);
        updateGameState();
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
export function renderBoard(
    board: HTMLElement,
    cubesArr: Cube[],
    playerHealthOverride?: number,
    unlockedUnlocks: { internalName: string }[] = [],
) {
    if (!board) return;
    board.innerHTML = '';
    // Remove Next Board button if present (should only show when board is finished)
    const nextBtn = document.getElementById('next-board-btn');
    if (nextBtn) nextBtn.remove();

    // Store unlocks for use in createNextBoardButton
    // unlockedUnlocks is now always passed explicitly as the 4th argument
    // Keep cubesArr in sync with global cubes
    cubes = cubesArr;

    // Find the score display for this board
    let scoreDisplay: HTMLElement | null = null;
    if (board.id === 'human-board') {
        scoreDisplay = document.getElementById('human-score');
    } else if (board.id === 'computer-board') {
        scoreDisplay = document.getElementById('computer-score');
    }

    const cubeDivs: HTMLDivElement[] = [];

    let selectedIndices: number[] = [];

    function updateScoreDisplay() {
        if (!scoreDisplay) return;
        const baseScore = (typeof totalScore === 'number' ? totalScore : 0).toString();
        // Only count non-special blocks for group score
        const nonSpecialCount = selectedIndices.filter((idx) => !cubes[idx].special).length;
        if (selectedIndices.length > 0 && nonSpecialCount > 0) {
            const groupScore = calculateGroupScore(nonSpecialCount);
            scoreDisplay.textContent = `${baseScore} (+${groupScore})`;
        } else {
            scoreDisplay.textContent = baseScore;
        }
    }

    // Ensure score display is reset after group removal
    function removeSelectedGroup(boardState: BoardState, boardElement: HTMLElement) {
        // Calculate the score for the group before removal
        const nonSpecialCount = selectedIndices.filter((idx) => !cubes[idx].special).length;
        const groupScore = calculateGroupScore(nonSpecialCount);

        // Update both scores
        totalScore += groupScore;
        boardScore += groupScore;
        if (boardScore > maxBoardScore) {
            maxBoardScore = boardScore;
        }
        if (scoreDisplay) {
            scoreDisplay.textContent = totalScore.toString();
        }

        // Remove selected blocks
        cubeDivs.forEach((div, idx) => {
            if (div.classList.contains('selected')) {
                cubes[idx].color = null;
                // Also clear special property if present
                if (cubes[idx].special) {
                    delete cubes[idx].special;
                }
            }
        });
        boardState.applyGravity();
        // Save removed group indices for stats
        const removedGroup = [...selectedIndices];
        selectedIndices = [];
        renderBoard(board, cubes, undefined, unlockedUnlocks);
        // Pass removed group to game state change callback
        if (onGameStateChange) {
            onGameStateChange(getGameState(), removedGroup);
        } else {
            updateGameState();
        }

        // --- New logic: Check if board is finished ---
        if (isBoardFinished(cubes)) {
            // 1. Change board visual to show inactive
            board.classList.add('inactive');
            // 2. Board is finished, updateGameState
            updateGameState();

            // 3. Always show "Next Board" button if board is finished
            createNextBoardButton(board, cubes, unlockedUnlocks);
        }
    }

    for (let i = 0; i < 100; i++) {
        const cubeDiv = document.createElement('div');
        cubeDiv.className = 'cube';
        if (cubes[i].special === 'plus1') {
            cubeDiv.style.setProperty('--cube-color', 'grey');
            cubeDiv.textContent = '+1';
            cubeDiv.style.color = '#fff';
            cubeDiv.style.fontWeight = 'bold';
            cubeDiv.style.fontSize = '1.1em';
            cubeDiv.style.display = 'flex';
            cubeDiv.style.alignItems = 'center';
            cubeDiv.style.justifyContent = 'center';
        } else {
            cubeDiv.style.setProperty('--cube-color', cubes[i]?.color || '#fff');
        }
        if (cubes[i].color === null) {
            cubeDiv.style.opacity = '0.2';
            cubeDiv.style.pointerEvents = 'none';
        }
        cubeDivs.push(cubeDiv);

        cubeDiv.addEventListener('click', (event) => {
            event.stopPropagation();
            // Prevent selecting special blocks as initial selection
            if (cubes[i].special) return;
            // --- Group info collection ---
            const boardState = new BoardState(cubes);
            // Use the standalone function for before-special group calculation
            const getConnectedIndicesBeforeSpecialLocal = (startIdx: number) =>
                getConnectedIndicesBeforeSpecial(startIdx, cubes);
            const groupInfo = createGroupCollectionInfo(
                cubes,
                i,
                (startIdx) => getConnectedIndices(startIdx, cubes),
                getConnectedIndicesBeforeSpecialLocal,
            );
            // Only allow selection if groupIndicesBeforeSpecial is at least size 2
            if (groupInfo.groupIndicesBeforeSpecial.length < 2) return;
            // If this block is already selected
            if (cubeDiv.classList.contains('selected')) {
                // Remove all selected blocks (set color to null) and hide current block score
                const boardState = new BoardState(cubes);
                removeSelectedGroup(boardState, board);
                updateGameState();
                return;
            }
            // First, clear all selections
            cubeDivs.forEach((div) => div.classList.remove('selected'));
            // Select all connected cubes
            groupInfo.groupIndicesAfterSpecial.forEach((idx) => cubeDivs[idx].classList.add('selected'));
            selectedIndices = groupInfo.groupIndicesAfterSpecial;
            updateScoreDisplay();
            updateGameState();
            // --- Log group info for human player ---
            // Only log for human board (board.id === 'human-board')
            if (board.id === 'human-board') {
                // Compose a brief but clear log message
                console.log(
                    `[Group] Clicked idx=${groupInfo.clickedIndex} color=${groupInfo.clickedColor} | ` +
                        `BeforeSpecial: ${groupInfo.groupIndicesBeforeSpecial.length} [${groupInfo.groupIndicesBeforeSpecial.join(',')}] | ` +
                        `AfterSpecial: ${groupInfo.groupIndicesAfterSpecial.length} [${groupInfo.groupIndicesAfterSpecial.join(',')}] | ` +
                        `NonSpecial: ${groupInfo.nonSpecialGroupIndices.length} [${groupInfo.nonSpecialGroupIndices.join(',')}] | ` +
                        `Special: ${groupInfo.specialGroupIndices.length} [${groupInfo.specialGroupIndices.join(',')}]`,
                );
            }
        });

        board.appendChild(cubeDiv);
    }

    // Deselect all cubes if clicking outside selected cubes
    document.addEventListener('click', function handleDocClick(event) {
        if (cubeDivs.some((div) => div.classList.contains('selected'))) {
            const target = event.target as HTMLElement;
            if (!target.classList.contains('selected')) {
                cubeDivs.forEach((div) => div.classList.remove('selected'));
                selectedIndices = [];
                updateScoreDisplay();
            }
        }
    });
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

// No longer create cubes or render board here; handled in index.ts

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

// Add this CSS to your stylesheet for the inactive board effect:
// .inactive { opacity: 0.5; pointer-events: none; }

// Make sure you have elements with IDs 'player-health' and 'board-number' in your HTML.
