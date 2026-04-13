import '../css/styles.css';
import { createInitialGameState, loadGameStateFromStorage } from './initialization';
import { initializeUi } from './ui/AppInit';
import './bridge/nextBoardBridge';

/**
 * The main entry point for the Blocks Game application.
 */

// --- GameState Initialization ---
const loadedState = loadGameStateFromStorage();
const gameState = loadedState ?? createInitialGameState();
// Always set window.gameState as the source of truth
(window as any).gameState = gameState;

// --- UI Setup ---
initializeUi();

// This is where the code that sets up the game lives... calls to initialize the game, load assets, etc.

// (Legacy DOMContentLoaded code moved to AppInit.ts as a comment)
