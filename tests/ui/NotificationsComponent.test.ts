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

    it('does not show a move as a pop-up (it is shown on the board instead)', () => {
        showNotifications([
            { kind: 'blocksRemoved', player: 'human', clicked: 0, removed: [0, 1], score: 3, cameFrom: [], added: [] },
        ]);
        expect(shown()).toHaveLength(0);
    });

    it('sums up the time away: how long, the boards finished, and what was earned', () => {
        showNotifications([
            { kind: 'awayProgress', awayMs: 135 * 60000, capped: false, boards: 14, score: 3200, gems: 1 },
        ]);
        const text = shown()[0].textContent;
        expect(text).toContain('While you were away');
        expect(text).toContain('finished 14 boards');
        expect(text).toContain('In 2 hours 15 minutes, it scored 3200, earning 3200 Chips, and 1 Gem from milestones.');
    });

    it('says when the time away hit the most that counts', () => {
        showNotifications([{ kind: 'awayProgress', awayMs: 8 * 3600000, capped: true, boards: 1, score: 5, gems: 0 }]);
        expect(shown()[0].textContent).toContain('finished 1 board');
        expect(shown()[0].textContent).toContain('In 8 hours (the most that counts), it scored 5, earning 5 Chips.');
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
