import type { CurrencyId } from '../types/CurrencyId';
import type { GameState } from '../types/GameState';
import type { PlayerId } from '../types/PlayerId';
import type { PlayerState } from '../types/PlayerState';
import type { SpecialBlockSpawn } from '../types/SpecialBlockSpawn';
import type { Upgrade } from '../types/Upgrade';
import type { UpgradeOffer } from '../types/UpgradeOffer';
import { ALL_AUGMENTATIONS, GREEDY } from '../data/augmentations';
import { AWAY_SPEED_KEPT_BY_LEVEL } from '../data/away';
import { LARGEST_BOARD_SIZE, STARTING_BOARD_SIZE } from '../data/board';
import { SPECIAL_BLOCK_SPAWNS } from '../data/specialBlocks';
import {
    ALL_UPGRADES,
    AWAY_PLAY,
    BOARD_SIZE,
    BOARD_SIZE_PER_LEVEL,
    COMPUTER_BASE_TURN_MS,
    COMPUTER_SPEED,
    COMPUTER_SPEED_FACTOR_PER_LEVEL,
    GREEDY_GROUPS,
    GREEDY_GROUPS_BY_LEVEL,
    BIGGER_BLOCK_CHANCE_PER_LEVEL,
    PLUS2_CHANCE,
} from '../data/upgrades';
import { getAwayPlayMs } from './awayPlayTime';
import { getPlayerState } from './getPlayerState';

/**
 * The rules for Upgrades: what they cost, whether they can be bought, and what each level does.
 */

/** "Better While Away" describes its effect by what a night away (8 hours) is worth */
const OVERNIGHT_MS = 8 * 60 * 60 * 1000;

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
 * Returns the cost of buying the next level of an Upgrade: its base cost, multiplied by its cost scaling for each level
 * already bought (the player's own scaling, if it has one per player), rounded.
 *
 * @param upgrade - The Upgrade's definition
 * @param currentLevel - The level the player has now
 * @param player - The player it is being bought for
 * @returns The cost of the next level
 */
export function getUpgradeCost(upgrade: Upgrade, currentLevel: number, player: PlayerId): number {
    const scaling = upgrade.costScalingByPlayer?.[player] ?? upgrade.costScaling;
    return Math.round(upgrade.baseCost * scaling ** currentLevel);
}

/**
 * Returns the highest level an Upgrade can be bought to for a player.
 *
 * @param upgrade - The Upgrade's definition
 * @param player - The player it is being bought for
 * @returns The highest level, or undefined if there is no limit
 */
export function getUpgradeMaxLevel(upgrade: Upgrade, player: PlayerId): number | undefined {
    return upgrade.maxLevelByPlayer?.[player] ?? upgrade.maxLevel;
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
    const maxLevel = getUpgradeMaxLevel(upgrade, player);
    const atMax = maxLevel !== undefined && level >= maxLevel;
    const cost = atMax ? undefined : getUpgradeCost(upgrade, level, player);
    const missing = upgrade.requiresAugmentation;
    const requires =
        missing !== undefined && !playerState.augmentations.includes(missing)
            ? (ALL_AUGMENTATIONS.find((a) => a.internalName === missing)?.displayName ?? missing)
            : undefined;
    return {
        upgrade: upgrade.internalName,
        player,
        level,
        effect: describeEffect(playerState, player, upgrade.internalName),
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
 * Returns the chance of one kind of special block appearing on a player's next board, in percent. Over 100, each full
 * 100% is a guaranteed block, and the rest is the chance of one more.
 *
 * @param playerState - The player's state
 * @param spawn - How that kind of special block gets onto boards (see data/specialBlocks.ts)
 * @returns The chance in percent (0 if the player doesn't have its Augmentation)
 */
export function getSpecialBlockChance(playerState: PlayerState, spawn: SpecialBlockSpawn): number {
    if (!playerState.augmentations.includes(spawn.augmentation)) return 0;
    return spawn.baseChance + getUpgradeLevel(playerState, spawn.chanceUpgrade) * spawn.chancePerLevel;
}

/**
 * Decides how many of one kind of special block go on a new board, from the chance: one for each full 100%, plus one
 * more with a chance of whatever is left over. For example, 150% gives one for sure, and a 50% chance of a second.
 *
 * @param chance - The chance, in percent
 * @param random - A random number from 0 (inclusive) to 1 (exclusive)
 * @returns The number of special blocks
 */
export function rollSpecialBlockCount(chance: number, random: number = Math.random()): number {
    const guaranteed = Math.floor(chance / 100);
    return guaranteed + (random * 100 < chance % 100 ? 1 : 0);
}

/**
 * Returns the chance, in percent, that each block of a kind with a bigger version (a +1, or a bomb) is placed as the
 * bigger version instead (a +2, or a big bomb): the level of its "bigger" Upgrade times BIGGER_BLOCK_CHANCE_PER_LEVEL.
 * The Upgrade's highest level keeps it to 50% at most.
 *
 * @param playerState - The player's state
 * @param spawn - How that kind of special block gets onto boards
 * @returns The chance in percent (0 if the kind has no bigger version, or the Upgrade hasn't been bought)
 */
export function getBiggerBlockChance(playerState: PlayerState, spawn: SpecialBlockSpawn): number {
    if (spawn.bigger === undefined) return 0;
    return getUpgradeLevel(playerState, spawn.bigger.chanceUpgrade) * BIGGER_BLOCK_CHANCE_PER_LEVEL;
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
 * Returns how much of its speed the computer player keeps from one step of time away to the next (see
 * AWAY_SPEED_KEPT_BY_LEVEL), from its level of the "Better While Away" Upgrade.
 *
 * @param playerState - The computer player's state
 * @returns The share of the speed kept (0.5 with no levels)
 */
export function getAwaySpeedKept(playerState: PlayerState): number {
    const level = Math.min(getUpgradeLevel(playerState, AWAY_PLAY), AWAY_SPEED_KEPT_BY_LEVEL.length - 1);
    return AWAY_SPEED_KEPT_BY_LEVEL[level];
}

/**
 * Returns the size a player's next board should be: their starting size, plus the "Bigger Board" Upgrade, never
 * larger than their largest size (a save from before the sizes changed can have more levels than are now allowed).
 *
 * @param playerState - The player's state
 * @param player - Which player it is (each has its own starting and largest size)
 * @returns The width and height
 */
export function getBoardSize(playerState: PlayerState, player: PlayerId): { width: number; height: number } {
    const extra = getUpgradeLevel(playerState, BOARD_SIZE) * BOARD_SIZE_PER_LEVEL;
    const size = Math.min(STARTING_BOARD_SIZE[player] + extra, LARGEST_BOARD_SIZE[player]);
    return { width: size, height: size };
}

/**
 * Describes, in words, what a player's current level of an Upgrade does.
 *
 * @param playerState - The player's state
 * @param player - Which player it is
 * @param upgrade - The Upgrade's internalName
 * @returns The description (e.g. "125% chance")
 */
function describeEffect(playerState: PlayerState, player: PlayerId, upgrade: string): string {
    const spawn = SPECIAL_BLOCK_SPAWNS.find((s) => s.chanceUpgrade === upgrade);
    if (spawn !== undefined) return `${getSpecialBlockChance(playerState, spawn)}% chance per board`;
    const biggerOf = SPECIAL_BLOCK_SPAWNS.find((s) => s.bigger?.chanceUpgrade === upgrade);
    if (biggerOf !== undefined) {
        const name = upgrade === PLUS2_CHANCE ? '+1 blocks are +2 blocks' : 'bombs are big bombs';
        return `${getBiggerBlockChance(playerState, biggerOf)}% of ${name}`;
    }
    switch (upgrade) {
        case GREEDY_GROUPS: {
            const groups = getGreedyGroupsChecked(playerState);
            const greedy = playerState.augmentations.includes(GREEDY);
            return !greedy ? 'Not active' : groups === Infinity ? 'Checks every group' : `Checks ${groups} groups`;
        }
        case COMPUTER_SPEED:
            return `A turn every ${(getComputerTurnMs(playerState) / 1000).toFixed(2)} seconds`;
        case BOARD_SIZE: {
            const { width, height } = getBoardSize(playerState, player);
            return `${width}x${height} board`;
        }
        case AWAY_PLAY: {
            const overnight = getAwayPlayMs(OVERNIGHT_MS, getAwaySpeedKept(playerState));
            return `8 hours away is worth ${describePlayTime(overnight)} of play`;
        }
        default:
            return '';
    }
}

/**
 * Describes a length of play in words, for the "Better While Away" Upgrade: minutes under an hour, otherwise hours
 * (to the nearest tenth).
 *
 * @param ms - The length of play, in milliseconds
 * @returns The description (e.g. "53 minutes", "2.7 hours")
 */
function describePlayTime(ms: number): string {
    const minutes = ms / (60 * 1000);
    return minutes < 60 ? `${Math.round(minutes)} minutes` : `${(minutes / 60).toFixed(1)} hours`;
}
