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

    // Changed 2026-10-03: the computer plays slower the longer it's away, so the summary says how much play the time
    // was worth
    it('sums up the time away: how long, how much play it was worth, the boards finished, and what was earned', () => {
        showNotifications([
            {
                kind: 'awayProgress',
                awayMs: 135 * 60000,
                playMs: 39 * 60000,
                capped: false,
                boards: 14,
                score: 3200,
                gems: 1,
            },
        ]);
        const text = shown()[0].textContent;
        expect(text).toContain('While you were away');
        expect(text).toContain('finished 14 boards');
        expect(text).toContain(
            "You were away for 2 hours 15 minutes, worth 39 minutes of play (the computer slows down the longer you're away).",
        );
        expect(text).toContain('It scored 3200, earning 3200 Chips, and 1 Gem from milestones.');
    });

    it("doesn't mention slowing down for a short time away, played at full speed", () => {
        showNotifications([
            { kind: 'awayProgress', awayMs: 5 * 60000, playMs: 5 * 60000, capped: false, boards: 1, score: 5, gems: 0 },
        ]);
        expect(shown()[0].textContent).toContain('finished 1 board');
        expect(shown()[0].textContent).toContain('You were away for 5 minutes. It scored 5, earning 5 Chips.');
    });

    it('says when only part of the time away counted', () => {
        showNotifications([
            {
                kind: 'awayProgress',
                awayMs: 3 * 24 * 3600000,
                playMs: 60 * 60000,
                capped: true,
                boards: 9,
                score: 900,
                gems: 0,
            },
        ]);
        expect(shown()[0].textContent).toContain(
            'You were away for 3 days (only the first 16 hours count), worth 1 hour of play',
        );
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
