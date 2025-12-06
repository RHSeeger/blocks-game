/**
 * Creates a 10x10 board of colored blocks and renders it inside the given container.
 * @param container - The DOM element to render the board into.
 */
export function createBoard(container: HTMLElement): void {
    const colors = ['red', 'green', 'blue', 'yellow'];
    container.innerHTML = '';
    for (let row = 0; row < 10; row++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'board-row';
        for (let col = 0; col < 10; col++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            const block = document.createElement('div');
            block.className = 'block';
            block.style.background = color;
            block.style.width = '1.5em';
            block.style.height = '1.5em';
            block.style.borderRadius = '0.2em';
            block.style.border = '1px solid #ccc';
            block.style.boxSizing = 'border-box';
            rowDiv.appendChild(block);
        }
        container.appendChild(rowDiv);
    }
}
