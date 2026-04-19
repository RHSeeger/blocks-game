console.log('[index.ts] ENTRY FILE LOADED');
import '../css/styles.css';
import { createInitialGameState, loadGameStateFromStorage } from './initialization';
import { initializeUi } from './ui/AppInit';
import './bridge/nextBoardBridge';
import { computerTurn } from './gamelogic/computerTurn';

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
const COMPUTER_MOVE_INTERVAL_MS = 1000;
setInterval(() => {
	console.log('[index.ts] computer interval fired');
	computerTurn(gameState);
}, COMPUTER_MOVE_INTERVAL_MS);

// (Legacy DOMContentLoaded code moved to AppInit.ts as a comment)
