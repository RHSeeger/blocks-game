// Tests for createNextBoardButton in board.ts
import { createNextBoardButton } from '../../src/typescript/BoardState';

describe('createNextBoardButton', () => {
    it('creates a button element with correct text', () => {
        const onClick = jest.fn();
        const btn = createNextBoardButton(onClick);
        expect(btn).toBeInstanceOf(HTMLButtonElement);
        expect(btn.textContent?.toLowerCase()).toContain('next board');
    });
    it('calls onClick when clicked', () => {
        const onClick = jest.fn();
        const btn = createNextBoardButton(onClick);
        btn.click();
        expect(onClick).toHaveBeenCalled();
    });
});
