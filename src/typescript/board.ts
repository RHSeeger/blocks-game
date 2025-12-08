type Cube = {
  color: string;
};

export function renderBoard(board: HTMLElement, cubes: Cube[]) {
  if (!board) return;
  board.innerHTML = '';

  for (let i = 0; i < 100; i++) {
    const cubeDiv = document.createElement('div');
    cubeDiv.className = 'cube';
    cubeDiv.style.backgroundColor = cubes[i]?.color || '#fff';
    board.appendChild(cubeDiv);
  }
}

// Example usage:
const cubes: Cube[] = Array.from({ length: 100 }, (_, i) => ({
  color: ['red', 'green', 'blue', 'yellow', 'orange'][i % 5],
}));

document.addEventListener('DOMContentLoaded', () => {
  const humanBoard = document.getElementById('human-board');
  if (humanBoard) {
    renderBoard(humanBoard, cubes);
  }
});
