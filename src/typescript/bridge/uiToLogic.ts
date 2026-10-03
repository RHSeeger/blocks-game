import type { CurrencyId } from '../types/CurrencyId';
import type { PlayerId } from '../types/PlayerId';
import { blockClicked } from '../gamelogic/actions/blockClicked';
import { buyUpgrade } from '../gamelogic/actions/buyUpgrade';
import { deselect } from '../gamelogic/actions/deselect';
import { grantAchievement } from '../gamelogic/actions/grantAchievement';
import { grantCurrency } from '../gamelogic/actions/grantCurrency';
import { setIntroSeen } from '../gamelogic/actions/setIntroSeen';
import { nextBoard } from '../gamelogic/actions/nextBoard';
import { resetGame } from '../gamelogic/actions/resetGame';
import { resetHumanBoard } from '../gamelogic/actions/resetHumanBoard';

/**
 * Bridge: UI → Game Logic.
 *
 * The functions the UI calls to report what the user did. Each one passes the call to the matching game-logic entry
 * point, and contains no logic of its own. No game state is passed; game logic reads it from its own store.
 */

/**
 * The user clicked a block on the human player's board.
 *
 * @param index - The index of the clicked block
 */
export function onBlockClicked(index: number): void {
    blockClicked(index);
}

/**
 * The user clicked somewhere other than a block, while a group was selected.
 */
export function onDeselect(): void {
    deselect();
}

/**
 * The user clicked the "Next Board" button.
 */
export function onNextBoardClicked(): void {
    nextBoard();
}

/**
 * The user confirmed resetting the whole game.
 */
export function onResetGameClicked(): void {
    resetGame();
}

/**
 * The user clicked "Reset Human Player Board".
 */
export function onResetHumanBoardClicked(): void {
    resetHumanBoard();
}

/**
 * The user clicked "Buy" for an Upgrade.
 *
 * @param upgrade - The Upgrade's internalName
 * @param player - The player it is for
 */
export function onBuyUpgradeClicked(upgrade: string, player: PlayerId): void {
    buyUpgrade(upgrade, player);
}

/**
 * The user closed the introduction pop-up.
 */
export function onIntroClosed(): void {
    setIntroSeen(true);
}

/**
 * The user asked to see the introduction pop-up again.
 */
export function onShowIntroClicked(): void {
    setIntroSeen(false);
}

/**
 * The user clicked "Grant" for an achievement (a debug tool).
 *
 * @param achievement - The achievement's internalName
 */
export function onGrantAchievementClicked(achievement: string): void {
    grantAchievement(achievement);
}

/**
 * The user clicked a button to add some currency (a debug tool).
 *
 * @param currency - Which currency
 * @param amount - How much to add
 */
export function onGrantCurrencyClicked(currency: CurrencyId, amount: number): void {
    grantCurrency(currency, amount);
}
