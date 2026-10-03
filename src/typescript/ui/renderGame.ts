import type { DerivedGameInfo } from '../types/DerivedGameInfo';
import type { GameNotification } from '../types/GameNotification';
import type { ReadonlyGameState } from '../types/ReadonlyGameState';
import { renderAchievements } from './AchievementsComponent';
import { renderAugmentations } from './AugmentationsComponent';
import { startMoveAnimations } from './BoardAnimations';
import { renderIntro } from './IntroComponent';
import { showNotifications } from './NotificationsComponent';
import { renderPlayerArea } from './PlayerComponent';
import { renderStats } from './StatsComponent';
import { renderUpgrades, renderWallet } from './UpgradesComponent';

/**
 * Draws the whole game display from the game state. Called (through the bridge) every time the game state changes.
 */

/**
 * Draws the whole game display: both players' areas and every tab.
 *
 * @param gameState - The game state (read-only)
 * @param derived - Values calculated from the game state by game logic
 * @param notifications - Anything that just happened that the player should be told about
 */
export function renderGame(
    gameState: ReadonlyGameState,
    derived: DerivedGameInfo,
    notifications: readonly GameNotification[],
): void {
    // Moves are shown in two steps around the redraw (see BoardAnimations)
    const finishMoveAnimations = startMoveAnimations(notifications);
    renderPlayerArea('human', gameState.humanPlayer, derived.boardFinished.human, gameState.gemGoalBoardScore);
    renderPlayerArea(
        'computer',
        gameState.computerPlayer,
        derived.boardFinished.computer,
        derived.nextComputerMilestoneBoard,
    );
    finishMoveAnimations.forEach((finish) => finish());
    renderStats(gameState);
    renderAchievements(gameState);
    renderAugmentations(gameState);
    renderWallet(gameState);
    renderUpgrades(derived.upgradeOffers);
    renderIntro(gameState.introSeen);
    showNotifications(notifications);
}
