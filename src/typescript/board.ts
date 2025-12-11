export type Cube = {
  color: string | null; // null means blank
};

import type { GameState } from "./index";

export function getConnectedIndices(startIdx: number, cubes: Cube[]): number[] {
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

    // Check neighbors: up, down, left, right
    const neighbors: number[] = [];
    if (row > 0) neighbors.push(idx - 10); // up
    if (row < 9) neighbors.push(idx + 10); // down
    if (col > 0) neighbors.push(idx - 1);  // left
    if (col < 9) neighbors.push(idx + 1);  // right

    for (const nIdx of neighbors) {
      if (!visited.has(nIdx) && cubes[nIdx].color === targetColor) {
        toVisit.push(nIdx);
      }
    }
  }

  return Array.from(visited);
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
            cubes[idx].color = cubes[aboveIdx].color;
            cubes[aboveIdx].color = null;
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
            cubes[idx].color = cubes[rightIdx].color;
            cubes[rightIdx].color = null;
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

let onGameStateChange: ((state: GameState, removedGroup?: number[]) => void) | null = null;

export function getInitialCubes(): Cube[] {
  return Array.from({ length: 100 }, () => ({ color: getRandomColor() }));
}

export function setGameState(state: GameState, onChange: (state: GameState, removedGroup?: number[]) => void) {
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

export function getGameState(): GameState {
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
    // Generate new cubes
    for (let i = 0; i < cubesArr.length; i++) {
      cubesArr[i].color = getRandomColor();
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
    if (selectedIndices.length > 0) {
      const groupScore = calculateGroupScore(selectedIndices.length);
      scoreDisplay.textContent = `${baseScore} (+${groupScore})`;
    } else {
      scoreDisplay.textContent = baseScore;
    }
  }

  // Ensure score display is reset after group removal
  function removeSelectedGroup() {
    // Calculate the score for the group before removal
    const groupScore = calculateGroupScore(selectedIndices.length);

    // Update the game's current score
    playerScore += groupScore;
    if (scoreDisplay) {
      scoreDisplay.textContent = playerScore.toString();
    }

    // Remove selected blocks
    cubeDivs.forEach((div, idx) => {
      if (div.classList.contains('selected')) {
        cubes[idx].color = null;
      }
    });
    applyGravity(cubes);
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
    cubeDiv.style.setProperty('--cube-color', cubes[i]?.color || '#fff');
    if (cubes[i].color === null) {
      cubeDiv.style.opacity = '0.2';
      cubeDiv.style.pointerEvents = 'none';
    }
    cubeDivs.push(cubeDiv);

    cubeDiv.addEventListener('click', (event) => {
      event.stopPropagation();

      // Find all connected cubes of the same color
      const connected = getConnectedIndices(i, cubes);

      // If this block is already selected
      if (cubeDiv.classList.contains('selected')) {
        if (connected.length === 1) {
          // Only one block in group: just unselect it
          cubeDivs.forEach(div => div.classList.remove('selected'));
          selectedIndices = [];
          updateScoreDisplay();
        } else {
          // Remove all selected blocks (set color to null) and hide current block score
          removeSelectedGroup();
        }
        updateGameState();
        return;
      }

      // First, clear all selections
      cubeDivs.forEach(div => div.classList.remove('selected'));

      // Select all connected cubes
      connected.forEach(idx => cubeDivs[idx].classList.add('selected'));
      selectedIndices = connected;
      updateScoreDisplay();
      updateGameState();
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
