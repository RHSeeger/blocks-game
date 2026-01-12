/**
 * resetGameState.ts
 * Provides a function to reset the entire game state and trigger UI updates.
 */
import { BoardState, getInitialCubes } from './BoardState';
import type { GameState } from './GameState';
import { saveGameState, loadGameStateFromStorage } from './initialization';
import { updatePlayerComponent } from './ui/PlayerComponent';
import { renderComputerBoard } from './ui/GameComponent';
import { updateStatsDisplay } from './ui/StatsComponent';

/**
 * Resets the entire game state and triggers UI updates.
 * @param gameState The GameState object to reset (will be mutated)
 * @param humanBoardContainer The HTMLElement for the human board
 * @param computerBoardContainer The HTMLElement for the computer board
 */
export function resetGameStateAndRender(
    gameState: GameState,
    humanBoardContainer: HTMLElement,
    computerBoardContainer: HTMLElement,
) {
    Object.assign(gameState, loadGameStateFromStorage());
    gameState.humanPlayer = {
        board: new BoardState(getInitialCubes('player', gameState.unlockedUnlocks)),
        totalScore: 0,
        boardScore: 0,
        maxBoardScore: 0,
        boardNumber: 1,
    };
    gameState.computerPlayer = {
        board: new BoardState(getInitialCubes('computer', gameState.unlockedUnlocks)),
        totalScore: 0,
        boardScore: 0,
        maxBoardScore: 0,
        boardNumber: 1,
    };
    gameState.gameStats = { largestGroup: 0, groupSizeCounts: {} };
    gameState.accomplishedAchievements = [];
    gameState.unlockedUnlocks = [];
    saveGameState(gameState);
    updateStatsDisplay(gameState);
    humanBoardContainer.classList.remove('inactive');
    updatePlayerComponent(humanBoardContainer, gameState.humanPlayer.board.cubes, gameState.humanPlayer);
    // You may want to update board score displays here if needed
    renderComputerBoard(computerBoardContainer, gameState);
}
