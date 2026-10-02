import type { CurrencyId } from '../types/CurrencyId';
import type { GameState } from '../types/GameState';
import type { PlayerId } from '../types/PlayerId';
import type { PlayerState } from '../types/PlayerState';
import type { Upgrade } from '../types/Upgrade';
import type { UpgradeOffer } from '../types/UpgradeOffer';
import { ALL_AUGMENTATIONS, GREEDY, PLUS1_BLOCK } from '../data/augmentations';
import { STARTING_BOARD_HEIGHT, STARTING_BOARD_WIDTH } from '../data/board';
import {
    ALL_UPGRADES,
    BOARD_SIZE,
    BOARD_SIZE_PER_LEVEL,
    COMPUTER_BASE_TURN_MS,
    COMPUTER_SPEED,
    COMPUTER_SPEED_FACTOR_PER_LEVEL,
    GREEDY_GROUPS,
    GREEDY_GROUPS_BY_LEVEL,
    PLUS1_BASE_CHANCE,
    PLUS1_CHANCE,
    PLUS1_CHANCE_PER_LEVEL,
} from '../data/upgrades';
import { getPlayerState } from './getPlayerState';

/**
 * The rules for Upgrades: what they cost, whether they can be bought, and what each level does.
 */

/**
 * Returns a player's level for an Upgrade.
 *
 * @param playerState - The player's state
 * @param upgrade - The Upgrade's internalName
 * @returns The level (0 if it has never been bought)
 */
export function getUpgradeLevel(playerState: PlayerState, upgrade: string): number {
    return playerState.upgradeLevels[upgrade] ?? 0;
}

/**
 * Returns which currency an Upgrade costs for a player: Gems for game-changing Upgrades; for everyday Upgrades, the
 * currency the *other* player earns (Chips for the human, Coins for the computer).
 *
 * @param upgrade - The Upgrade's definition
 * @param player - The player it is being bought for
 * @returns The currency
 */
export function getUpgradeCurrency(upgrade: Upgrade, player: PlayerId): CurrencyId {
    if (upgrade.tier === 'gameChanging') return 'gems';
    return player === 'human' ? 'chips' : 'coins';
}

/**
 * Returns the cost of buying the next level of an Upgrade.
 *
 * @param upgrade - The Upgrade's definition
 * @param currentLevel - The level the player has now
 * @returns The cost of the next level
 */
export function getUpgradeCost(upgrade: Upgrade, currentLevel: number): number {
    return Math.round(upgrade.baseCost * upgrade.costScaling ** currentLevel);
}

/**
 * Describes every Upgrade that can be bought for each player, and whether the next level can be bought right now.
 *
 * @param gameState - The game state
 * @returns One offer for each Upgrade and each player it can be bought for
 */
export function getUpgradeOffers(gameState: GameState): UpgradeOffer[] {
    return ALL_UPGRADES.flatMap((upgrade) =>
        upgrade.players.map((player) => describeOffer(gameState, upgrade, player)),
    );
}

/**
 * Describes one Upgrade, for one player, as it can be bought right now.
 *
 * @param gameState - The game state
 * @param upgrade - The Upgrade's definition
 * @param player - The player it is for
 * @returns The offer
 */
function describeOffer(gameState: GameState, upgrade: Upgrade, player: PlayerId): UpgradeOffer {
    const playerState = getPlayerState(gameState, player);
    const level = getUpgradeLevel(playerState, upgrade.internalName);
    const currency = getUpgradeCurrency(upgrade, player);
    const atMax = upgrade.maxLevel !== undefined && level >= upgrade.maxLevel;
    const cost = atMax ? undefined : getUpgradeCost(upgrade, level);
    const missing = upgrade.requiresAugmentation;
    const requires =
        missing !== undefined && !playerState.augmentations.includes(missing)
            ? (ALL_AUGMENTATIONS.find((a) => a.internalName === missing)?.displayName ?? missing)
            : undefined;
    return {
        upgrade: upgrade.internalName,
        player,
        level,
        effect: describeEffect(playerState, upgrade.internalName),
        currency,
        cost,
        requires,
        canBuy: cost !== undefined && requires === undefined && gameState.wallet[currency] >= cost,
    };
}

/**
 * Buys the next level of an Upgrade for a player, if it can be bought: spends the currency and raises the level.
 *
 * @param gameState - The game state (updated in place)
 * @param upgrade - The Upgrade's internalName
 * @param player - The player to buy it for
 * @returns True if it was bought; false if it can't be bought (unknown, not for this player, requirements not met,
 *          at its highest level, or not affordable)
 */
export function buyUpgradeLevel(gameState: GameState, upgrade: string, player: PlayerId): boolean {
    const definition = ALL_UPGRADES.find((u) => u.internalName === upgrade);
    if (definition === undefined || !definition.players.includes(player)) return false;
    const offer = describeOffer(gameState, definition, player);
    if (!offer.canBuy || offer.cost === undefined) return false;
    gameState.wallet[offer.currency] -= offer.cost;
    getPlayerState(gameState, player).upgradeLevels[upgrade] = offer.level + 1;
    return true;
}

/**
 * Returns the chance of a +1 block appearing on a player's next board, in percent. Over 100, each full 100% is a
 * guaranteed +1 block, and the rest is the chance of one more.
 *
 * @param playerState - The player's state
 * @returns The chance in percent (0 if the player doesn't have +1 Blocks)
 */
export function getPlus1Chance(playerState: PlayerState): number {
    if (!playerState.augmentations.includes(PLUS1_BLOCK)) return 0;
    return PLUS1_BASE_CHANCE + getUpgradeLevel(playerState, PLUS1_CHANCE) * PLUS1_CHANCE_PER_LEVEL;
}

/**
 * Decides how many +1 blocks go on a new board, from the chance: one for each full 100%, plus one more with a chance
 * of whatever is left over. For example, 150% gives one for sure, and a 50% chance of a second.
 *
 * @param chance - The chance, in percent
 * @param random - A random number from 0 (inclusive) to 1 (exclusive)
 * @returns The number of +1 blocks
 */
export function rollPlus1Count(chance: number, random: number = Math.random()): number {
    const guaranteed = Math.floor(chance / 100);
    return guaranteed + (random * 100 < chance % 100 ? 1 : 0);
}

/**
 * Returns how many groups the computer player checks before choosing a move, when it has Greedy.
 *
 * @param playerState - The computer player's state
 * @returns The number of groups (Infinity means every group)
 */
export function getGreedyGroupsChecked(playerState: PlayerState): number {
    const level = Math.min(getUpgradeLevel(playerState, GREEDY_GROUPS), GREEDY_GROUPS_BY_LEVEL.length - 1);
    return GREEDY_GROUPS_BY_LEVEL[level];
}

/**
 * Returns how long the computer player waits between turns.
 *
 * @param playerState - The computer player's state
 * @returns The time between turns, in milliseconds
 */
export function getComputerTurnMs(playerState: PlayerState): number {
    return COMPUTER_BASE_TURN_MS * COMPUTER_SPEED_FACTOR_PER_LEVEL ** getUpgradeLevel(playerState, COMPUTER_SPEED);
}

/**
 * Returns the size a player's next board should be.
 *
 * @param playerState - The player's state
 * @returns The width and height
 */
export function getBoardSize(playerState: PlayerState): { width: number; height: number } {
    const extra = getUpgradeLevel(playerState, BOARD_SIZE) * BOARD_SIZE_PER_LEVEL;
    return { width: STARTING_BOARD_WIDTH + extra, height: STARTING_BOARD_HEIGHT + extra };
}

/**
 * Describes, in words, what a player's current level of an Upgrade does.
 *
 * @param playerState - The player's state
 * @param upgrade - The Upgrade's internalName
 * @returns The description (e.g. "125% chance")
 */
function describeEffect(playerState: PlayerState, upgrade: string): string {
    switch (upgrade) {
        case PLUS1_CHANCE:
            return `${getPlus1Chance(playerState)}% chance per board`;
        case GREEDY_GROUPS: {
            const groups = getGreedyGroupsChecked(playerState);
            const greedy = playerState.augmentations.includes(GREEDY);
            return !greedy ? 'Not active' : groups === Infinity ? 'Checks every group' : `Checks ${groups} groups`;
        }
        case COMPUTER_SPEED:
            return `A turn every ${(getComputerTurnMs(playerState) / 1000).toFixed(2)} seconds`;
        case BOARD_SIZE: {
            const { width, height } = getBoardSize(playerState);
            return `${width}x${height} board`;
        }
        default:
            return '';
    }
}
