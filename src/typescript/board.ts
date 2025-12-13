// Information about a collected group when a block is clicked
export type GroupCollectionInfo = {
  clickedIndex: number; // The index of the block that was clicked
  clickedColor: string | null; // The color of the block that was clicked
  groupIndicesBeforeSpecial: number[]; // Indices in the group before special expansion (including special blocks)
  groupIndicesAfterSpecial: number[]; // Indices in the group after special expansion (including special blocks)
  nonSpecialGroupIndices: number[]; // Indices in the group after special expansion, only non-special blocks
  specialGroupIndices: number[]; // Indices in the group after special expansion, only special blocks

  // Derived info methods
  getGroupSizeBeforeSpecial(): number;
  getGroupSizeAfterSpecial(): number;
  getNonSpecialGroupSize(): number;
  getSpecialGroupSize(): number;
};

// Helper to create a GroupCollectionInfo object
export function createGroupCollectionInfo(
  cubes: Cube[],
  clickedIndex: number,
  getConnectedIndices: (startIdx: number) => number[],
  getConnectedIndicesBeforeSpecial?: (startIdx: number) => number[]
): GroupCollectionInfo {
  const clickedColor = cubes[clickedIndex]?.color ?? null;
  // Step 1: Get group before special expansion (if provided)
  let groupIndicesBeforeSpecial: number[];
  if (getConnectedIndicesBeforeSpecial) {
    // Use a custom traversal: only traverse through blocks of the clicked color, but include directly connected special blocks
    const visited = new Set<number>();
    const toVisit = [clickedIndex];
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
        if (neighbor.color === null) continue;
        if (neighbor.special) {
          // Include special block, but do not traverse further from it
          visited.add(nIdx);
          continue;
        }
        if (neighbor.color === clickedColor) {
          toVisit.push(nIdx);
        }
      }
    }
    groupIndicesBeforeSpecial = Array.from(visited);
  } else {
    // Fallback: use after-special as before-special if not provided
    const visited = new Set<number>();
    const toVisit = [clickedIndex];
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
        if (neighbor.color === null) continue;
        if (neighbor.special) {
          visited.add(nIdx);
          continue;
        }
        if (neighbor.color === clickedColor) {
          toVisit.push(nIdx);
        }
      }
    }
    groupIndicesBeforeSpecial = Array.from(visited);
  }
  // Step 2: Get group after special expansion, filter out empty/removed blocks
  const groupIndicesAfterSpecial = getConnectedIndices(clickedIndex)
    .filter(idx => cubes[idx].color !== null);
  // Step 3: Partition after-special group into non-special and special
  const nonSpecialGroupIndices = groupIndicesAfterSpecial.filter(idx => !cubes[idx].special);
  const specialGroupIndices = groupIndicesAfterSpecial.filter(idx => cubes[idx].special);
  // Step 4: Return info object with methods
  return {
    clickedIndex,
    clickedColor,
    groupIndicesBeforeSpecial,
    groupIndicesAfterSpecial,
    nonSpecialGroupIndices,
    specialGroupIndices,
    getGroupSizeBeforeSpecial() { return this.groupIndicesBeforeSpecial.length; },
    getGroupSizeAfterSpecial() { return this.groupIndicesAfterSpecial.length; },
    getNonSpecialGroupSize() { return this.nonSpecialGroupIndices.length; },
    getSpecialGroupSize() { return this.specialGroupIndices.length; },
  };
}
import type { Cube } from "./cube";
import type { PlayerState } from "./playerState";

// BoardState type and class
// -------------------
// This class encapsulates the state and logic for a single board (array of Cubes) and related operations.

export class BoardState {
  cubes: Cube[];
  
  constructor(cubes: Cube[]) {
    this.cubes = cubes;
  }

  getConnectedIndices(startIdx: number): number[] {
    const targetColor = this.cubes[startIdx].color;
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
      if (col > 0) neighbors.push(idx - 1);  // left
      if (col < 9) neighbors.push(idx + 1);  // right

      for (const nIdx of neighbors) {
        if (visited.has(nIdx)) continue;
        const neighbor = this.cubes[nIdx];
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
    const hasPlus1 = groupIndices.some(idx => this.cubes[idx].special === 'plus1');
    if (hasPlus1) {
      const expanded = new Set<number>(groupIndices);
      for (const idx of groupIndices) {
        if (this.cubes[idx].special) continue; // Only expand from non-special blocks
        const row = Math.floor(idx / 10);
        const col = idx % 10;
        const neighbors: number[] = [];
        if (row > 0) neighbors.push(idx - 10);
        if (row < 9) neighbors.push(idx + 10);
        if (col > 0) neighbors.push(idx - 1);
        if (col < 9) neighbors.push(idx + 1);
        for (const nIdx of neighbors) {
          if (!this.cubes[nIdx].special) {
            expanded.add(nIdx);
          }
        }
      }
      return Array.from(expanded);
    }

    return groupIndices;
  }

  applyGravity() {
    // Gravity down
    for (let col = 0; col < 10; col++) {
      for (let row = 9; row >= 0; row--) {
        let idx = row * 10 + col;
        if (this.cubes[idx].color === null) {
          // Find the nearest non-empty block above
          for (let above = row - 1; above >= 0; above--) {
            let aboveIdx = above * 10 + col;
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
          let idx = row * 10 + col;
          if (this.cubes[idx].color === null) {
            // Find the nearest non-empty block to the right
            for (let right = col + 1; right < 10; right++) {
              let rightIdx = row * 10 + right;
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
    if (col > 0) neighbors.push(idx - 1);  // left
    if (col < 9) neighbors.push(idx + 1);  // right

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
  const hasPlus1 = groupIndices.some(idx => cubes[idx].special === 'plus1');
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
    return Array.from(expanded);
  }

  return groupIndices;
}

export function applyGravity(cubes: Cube[]) {
  // Gravity down
  for (let col = 0; col < 10; col++) {
    for (let row = 9; row >= 0; row--) {
      let idx = row * 10 + col;
      if (cubes[idx].color === null) {
        // Find the nearest non-empty block above
        for (let above = row - 1; above >= 0; above--) {
          let aboveIdx = above * 10 + col;
          if (cubes[aboveIdx].color !== null) {
            // Move both color and special property
            cubes[idx].color = cubes[aboveIdx].color;
            cubes[idx].special = cubes[aboveIdx].special;
            cubes[aboveIdx].color = null;
            delete cubes[aboveIdx].special;
            break;
          }
        }
      }
    }
  }
  // Gravity left
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      let idx = row * 10 + col;
      if (cubes[idx].color === null) {
        // Find the nearest non-empty block to the right
        for (let right = col + 1; right < 10; right++) {
          let rightIdx = row * 10 + right;
          if (cubes[rightIdx].color !== null) {
            // Move both color and special property
            cubes[idx].color = cubes[rightIdx].color;
            cubes[idx].special = cubes[rightIdx].special;
            cubes[rightIdx].color = null;
            delete cubes[rightIdx].special;
            break;
          }
        }
      }
    }
  }
  // Gravity left (repeat for extra passes)
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      let idx = row * 10 + col;
      if (cubes[idx].color === null) {
        // Find the nearest non-empty block to the right
        for (let right = col + 1; right < 10; right++) {
          let rightIdx = row * 10 + right;
          if (cubes[rightIdx].color !== null) {
            // Move both color and special property
            cubes[idx].color = cubes[rightIdx].color;
            cubes[idx].special = cubes[rightIdx].special;
            cubes[rightIdx].color = null;
            delete cubes[rightIdx].special;
            break;
          }
        }
      }
    }
  }
}

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

let playerHealth = 100;
let playerScore = 0;
let boardNumber = 1;
let cubes: Cube[] = [];

let onGameStateChange: ((state: PlayerState, removedGroup?: number[]) => void) | null = null;

export function getInitialCubes(boardType: 'player' | 'computer' = 'player'): Cube[] {
  // For the player board, check if the plus1Bricks unlock is unlocked
  let allowPlus1 = false;
  if (boardType === 'player') {
    // Check global unlockedUnlocks (set in index.ts)
    if (typeof window !== 'undefined' && (window as any).unlockedUnlocks) {
      allowPlus1 = (window as any).unlockedUnlocks.some((u: any) => u.internalName === 'plus1Bricks');
    }
  }
  const initialCubes: Cube[] = Array.from({ length: 100 }, () => ({ color: getRandomColor() }));
  if (boardType === 'player' && allowPlus1) {
    // Always add a +1 brick for player if unlocked
    // Find all non-edge indices
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

export function setGameState(state: PlayerState, onChange: (state: PlayerState, removedGroup?: number[]) => void) {
  cubes = state.cubes.map(c => ({ ...c }));
  playerHealth = state.playerHealth;
  playerScore = state.playerScore;
  boardNumber = state.boardNumber;
  onGameStateChange = onChange;
  updateHealthDisplay();
  updateBoardNumberDisplay();
  updateScoreDisplayGlobal();
}

function updateGameState(removedGroup?: number[]) {
  if (onGameStateChange) {
    onGameStateChange({
      cubes: cubes.map(c => ({ ...c })),
      playerHealth,
      playerScore,
      boardNumber,
    }, removedGroup);
  }
}

export function getGameState(): PlayerState {
  return {
    cubes: cubes.map(c => ({ ...c })),
    playerHealth,
    playerScore,
    boardNumber,
  };
}



function updateHealthDisplay() {
  const healthDisplay = document.getElementById('human-health');
  if (healthDisplay) healthDisplay.textContent = playerHealth.toString();
}

function updateScoreDisplayGlobal() {
  const scoreDisplay = document.getElementById('human-score');
  if (scoreDisplay) scoreDisplay.textContent = playerScore.toString();
}

function updateBoardNumberDisplay() {
  const boardNumDisplay = document.getElementById('human-board-number');
  if (boardNumDisplay) boardNumDisplay.textContent = boardNumber.toString();
}

export function createNextBoardButton(board: HTMLElement, cubesArr: Cube[]) {
  let btn = document.getElementById('next-board-btn') as HTMLButtonElement | null;
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'next-board-btn';
    btn.textContent = 'Next Board';
    btn.style.display = 'block';
    btn.style.margin = '10px auto';
    board.parentElement?.appendChild(btn);
  }
  btn.onclick = () => {
    // Generate new cubes using getInitialCubes to ensure special block logic
    const newCubes = getInitialCubes('player');
    for (let i = 0; i < cubesArr.length; i++) {
      cubesArr[i].color = newCubes[i].color;
      cubesArr[i].special = newCubes[i].special;
    }
    board.classList.remove('inactive');
    btn.remove();
    boardNumber++;
    updateBoardNumberDisplay();
    renderBoard(board, cubesArr);
    updateGameState();
  };
}

export function renderBoard(board: HTMLElement, cubesArr: Cube[]) {
  if (!board) return;
  board.innerHTML = '';
  // Remove Next Board button if present (should only show when board is finished)
  const nextBtn = document.getElementById('next-board-btn');
  if (nextBtn) nextBtn.remove();
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
    const baseScore = playerScore.toString();
    // Only count non-special blocks for group score
    const nonSpecialCount = selectedIndices.filter(idx => !cubes[idx].special).length;
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
    const nonSpecialCount = selectedIndices.filter(idx => !cubes[idx].special).length;
    const groupScore = calculateGroupScore(nonSpecialCount);

    // Update the game's current score
    playerScore += groupScore;
    if (scoreDisplay) {
      scoreDisplay.textContent = playerScore.toString();
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
    renderBoard(board, cubes);
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
      // 2. Reduce health by number of non-null blocks
      const remaining = cubes.filter(c => c.color !== null).length;
      playerHealth -= remaining;
      updateHealthDisplay();
      updateGameState();

      // 3. If health > 0, show "Next Board" button
      if (playerHealth > 0) {
        createNextBoardButton(board, cubes);
      }
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
      // For before-special, use the group before +1 expansion
      const getConnectedIndicesBeforeSpecial = (startIdx: number) => {
        // Replicate the logic but skip the +1 expansion step
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
        return Array.from(visited);
      };
      const groupInfo = createGroupCollectionInfo(
        cubes,
        i,
        (startIdx) => boardState.getConnectedIndices(startIdx),
        getConnectedIndicesBeforeSpecial
      );
      // Only count non-special blocks for group size
      if (groupInfo.getNonSpecialGroupSize() === 1) return;
      // If this block is already selected
      if (cubeDiv.classList.contains('selected')) {
        // Remove all selected blocks (set color to null) and hide current block score
        const boardState = new BoardState(cubes);
        removeSelectedGroup(boardState, board);
        updateGameState();
        return;
      }
      // First, clear all selections
      cubeDivs.forEach(div => div.classList.remove('selected'));
      // Select all connected cubes
      groupInfo.groupIndicesAfterSpecial.forEach(idx => cubeDivs[idx].classList.add('selected'));
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
          `Special: ${groupInfo.specialGroupIndices.length} [${groupInfo.specialGroupIndices.join(',')}]`
        );
      }
    });

    board.appendChild(cubeDiv);
  }

  // Deselect all cubes if clicking outside selected cubes
  document.addEventListener('click', function handleDocClick(event) {
    if (cubeDivs.some(div => div.classList.contains('selected'))) {
      const target = event.target as HTMLElement;
      if (!target.classList.contains('selected')) {
        cubeDivs.forEach(div => div.classList.remove('selected'));
        selectedIndices = [];
        updateScoreDisplay();
      }
    }
  });
}

function getRandomColor(): string {
  const colors = ['red', 'green', 'blue', 'yellow', 'orange'];
  return colors[Math.floor(Math.random() * colors.length)];
}


// No longer create cubes or render board here; handled in index.ts

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
