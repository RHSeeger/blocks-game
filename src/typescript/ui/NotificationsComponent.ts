import type { GameNotification } from '../types/GameNotification';
import { ALL_ACHIEVEMENTS } from '../data/achievements';
import { ALL_AUGMENTATIONS } from '../data/augmentations';
import { getElement } from './getElement';

/**
 * Shows notifications (achievements accomplished, Augmentations unlocked) as pop-ups that fade out on their own.
 */

/** How long a notification stays on screen before it starts to fade */
export const NOTIFICATION_DISPLAY_MS = 5000;

/** How long the fade takes (must match the transition on `.notification` in styles.css) */
export const NOTIFICATION_FADE_MS = 500;

const PLAYER_NAMES = { human: 'Human Player', computer: 'Computer Player' } as const;

/** The notifications shown as pop-ups (`blocksRemoved` is shown on the board instead; see BoardAnimations) */
type PopUpNotification = Exclude<GameNotification, { kind: 'blocksRemoved' }>;

/**
 * Shows each notification as a pop-up, which fades out and removes itself after a few seconds. Clicking a pop-up
 * dismisses it straight away. Notifications that aren't pop-ups (`blocksRemoved`) are skipped.
 *
 * @param notifications - The notifications to show (nothing is shown if empty)
 */
export function showNotifications(notifications: readonly GameNotification[]): void {
    const container = getElement('notifications');
    notifications.filter(isPopUp).forEach((notification) => {
        const { title, name, description } = describeNotification(notification);
        const element = document.createElement('div');
        element.className = `notification notification-${notification.kind}`;
        element.append(
            createTextElement('div', 'notification-title', title),
            createTextElement('div', 'notification-name', name),
            createTextElement('div', 'notification-description', description),
        );
        element.addEventListener('click', () => element.remove());
        container.append(element);
        setTimeout(() => {
            element.classList.add('fading');
            setTimeout(() => element.remove(), NOTIFICATION_FADE_MS);
        }, NOTIFICATION_DISPLAY_MS);
    });
}

/**
 * Determines whether a notification is shown as a pop-up.
 *
 * @param notification - The notification
 * @returns True for every kind except `blocksRemoved`
 */
function isPopUp(notification: GameNotification): notification is PopUpNotification {
    return notification.kind !== 'blocksRemoved';
}

/**
 * Works out the text to show for a notification.
 *
 * @param notification - The notification
 * @returns The heading, the name of what was awarded, and its description
 */
function describeNotification(notification: PopUpNotification): { title: string; name: string; description: string } {
    if (notification.kind === 'achievement') {
        const achievement = ALL_ACHIEVEMENTS.find((a) => a.internalName === notification.achievement);
        const gems = achievement?.gems ?? 0;
        return {
            title: 'Achievement accomplished!',
            name: achievement?.displayName ?? notification.achievement,
            description: `${achievement?.description ?? ''}${gems > 0 ? ` (+${gemsText(gems)})` : ''}`,
        };
    }
    if (notification.kind === 'gems') {
        return {
            title: 'Gems earned!',
            name: `+${gemsText(notification.amount)}`,
            description: describeGemSource(notification.source, notification.detail),
        };
    }
    const augmentation = ALL_AUGMENTATIONS.find((a) => a.internalName === notification.augmentation);
    return {
        title: `New Augmentation for the ${PLAYER_NAMES[notification.player]}`,
        name: augmentation?.displayName ?? notification.augmentation,
        description: augmentation?.description ?? '',
    };
}

/**
 * Returns an amount of Gems in words.
 *
 * @param amount - The number of Gems
 * @returns e.g. "1 Gem" or "2 Gems"
 */
function gemsText(amount: number): string {
    return `${amount} Gem${amount === 1 ? '' : 's'}`;
}

/**
 * Describes the goal that earned some Gems.
 *
 * @param source - Which goal it was
 * @param detail - The goal's number (the board score reached, or the number of boards the computer finished)
 * @returns The description
 */
function describeGemSource(source: 'boardGoal' | 'spotless' | 'computerMilestone', detail: number): string {
    switch (source) {
        case 'boardGoal':
            return `You finished a board with a board score of ${detail} or more. The next goal is higher.`;
        case 'spotless':
            return 'You finished a board with no blocks left.';
        case 'computerMilestone':
            return `The Computer Player finished ${detail} boards.`;
    }
}

/**
 * Creates an element containing the given text (as text, never HTML).
 *
 * @param tag - The element's tag name
 * @param className - The element's class
 * @param text - The text to put in it
 * @returns The element
 */
function createTextElement(tag: string, className: string, text: string): HTMLElement {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = text;
    return element;
}
