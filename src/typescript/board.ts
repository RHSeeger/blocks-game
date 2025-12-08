type Cube = {
  color: string;
};

function getConnectedIndices(startIdx: number, cubes: Cube[]): number[] {
  const targetColor = cubes[startIdx].color;
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

export function renderBoard(board: HTMLElement, cubes: Cube[]) {
  if (!board) return;
  board.innerHTML = '';

  const cubeDivs: HTMLDivElement[] = [];

  for (let i = 0; i < 100; i++) {
    const cubeDiv = document.createElement('div');
    cubeDiv.className = 'cube';
    cubeDiv.style.setProperty('--cube-color', cubes[i]?.color || '#fff');
    cubeDivs.push(cubeDiv);

    cubeDiv.addEventListener('click', (event) => {
      // Prevent the document click handler from firing
      event.stopPropagation();

      // First, clear all selections
      cubeDivs.forEach(div => div.classList.remove('selected'));

      // Find all connected cubes of the same color
      const connected = getConnectedIndices(i, cubes);

      // Select all connected cubes
      connected.forEach(idx => cubeDivs[idx].classList.add('selected'));
    });

    board.appendChild(cubeDiv);
  }

  // Deselect all cubes if clicking outside selected cubes
  document.addEventListener('click', function handleDocClick(event) {
    // If any cubes are selected
    if (cubeDivs.some(div => div.classList.contains('selected'))) {
      // Check if the click target is a selected cube
      const target = event.target as HTMLElement;
      if (!target.classList.contains('selected')) {
        cubeDivs.forEach(div => div.classList.remove('selected'));
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
