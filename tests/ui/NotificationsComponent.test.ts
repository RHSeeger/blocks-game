import {
    NOTIFICATION_DISPLAY_MS,
    NOTIFICATION_FADE_MS,
    showNotifications,
} from '../../src/typescript/ui/NotificationsComponent';
import { FIRST_CLEAR } from '../../src/typescript/data/achievements';
import { GREEDY } from '../../src/typescript/data/augmentations';

/**
 * Tests for the pop-up notifications.
 */

const shown = () => [...document.querySelectorAll('#notifications .notification')];

describe('showNotifications', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        document.body.innerHTML = '<div id="notifications"></div>';
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('shows nothing when there are no notifications', () => {
        showNotifications([]);
        expect(shown()).toHaveLength(0);
    });

    it('shows an achievement by its display name and description', () => {
        showNotifications([{ kind: 'achievement', achievement: FIRST_CLEAR }]);
        expect(shown()).toHaveLength(1);
        expect(shown()[0].textContent).toContain('Achievement accomplished!');
        expect(shown()[0].textContent).toContain('First Board Clear');
        expect(shown()[0].textContent).toContain('Finish your first board');
    });

    it('shows an Augmentation, and which player got it', () => {
        showNotifications([{ kind: 'augmentation', augmentation: GREEDY, player: 'computer' }]);
        expect(shown()[0].textContent).toContain('New Augmentation for the Computer Player');
        expect(shown()[0].textContent).toContain('Greedy');
    });

    it('fades out, then removes itself', () => {
        showNotifications([{ kind: 'achievement', achievement: FIRST_CLEAR }]);
        jest.advanceTimersByTime(NOTIFICATION_DISPLAY_MS);
        expect(shown()[0].classList.contains('fading')).toBe(true);
        jest.advanceTimersByTime(NOTIFICATION_FADE_MS);
        expect(shown()).toHaveLength(0);
    });

    it('is dismissed when clicked', () => {
        showNotifications([{ kind: 'achievement', achievement: FIRST_CLEAR }]);
        (shown()[0] as HTMLElement).click();
        expect(shown()).toHaveLength(0);
    });

    it('adds to the notifications already showing', () => {
        showNotifications([{ kind: 'achievement', achievement: FIRST_CLEAR }]);
        showNotifications([
            { kind: 'achievement', achievement: FIRST_CLEAR },
            { kind: 'augmentation', augmentation: GREEDY, player: 'computer' },
        ]);
        expect(shown()).toHaveLength(3);
    });
});
