type Cube = {
  color: string | null; // null means blank
};

function getConnectedIndices(startIdx: number, cubes: Cube[]): number[] {
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

function applyGravity(cubes: Cube[]) {
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

function calculateGroupScore(size: number): number {
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

export function renderBoard(board: HTMLElement, cubes: Cube[]) {
  if (!board) return;
  board.innerHTML = '';

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
    const baseScore = scoreDisplay.textContent?.replace(/\s*\(\+\d+\)/, '') || '0';
    if (selectedIndices.length > 0) {
      const groupScore = calculateGroupScore(selectedIndices.length);
      scoreDisplay.textContent = `${baseScore} (+${groupScore})`;
    } else {
      // Only show the base score, no parens or +number
      scoreDisplay.textContent = baseScore.trim();
    }
  }

  // Ensure score display is reset after group removal
  function removeSelectedGroup() {
    // Calculate the score for the group before removal
    const groupScore = calculateGroupScore(selectedIndices.length);

    // Update the game's current score
    if (scoreDisplay) {
      const baseScoreStr = scoreDisplay.textContent?.replace(/\s*\(\+\d+\)/, '') || '0';
      const baseScore = parseInt(baseScoreStr, 10) || 0;
      const newScore = baseScore + groupScore;
      scoreDisplay.textContent = newScore.toString();
    }

    // Remove selected blocks
    cubeDivs.forEach((div, idx) => {
      if (div.classList.contains('selected')) {
        cubes[idx].color = null;
      }
    });
    applyGravity(cubes);
    selectedIndices = [];
    renderBoard(board, cubes);
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
        return;
      }

      // First, clear all selections
      cubeDivs.forEach(div => div.classList.remove('selected'));

      // Select all connected cubes
      connected.forEach(idx => cubeDivs[idx].classList.add('selected'));
      selectedIndices = connected;
      updateScoreDisplay();
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

// Example usage:
const cubes: Cube[] = Array.from({ length: 100 }, () => ({
  color: getRandomColor(),
}));

document.addEventListener('DOMContentLoaded', () => {
  const humanBoard = document.getElementById('human-board');
  if (humanBoard) {
    renderBoard(humanBoard, cubes);
  }
});
