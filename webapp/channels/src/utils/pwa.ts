// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * Checks if the application is running as an installed PWA.
 * Uses display-mode media query and iOS Safari standalone heuristic.
 * @returns True if running as installed PWA
 */
export const isPWA = (): boolean => {
    if (typeof window === 'undefined' || !window.matchMedia) {
        return false;
    }
    if (window.matchMedia('(display-mode: standalone)').matches) {
        return true;
    }
    if (window.matchMedia('(display-mode: minimal-ui)').matches) {
        return true;
    }
    const nav = navigator as Navigator & {standalone?: boolean};
    return nav.standalone === true;
};

const MAX_BADGE_COUNT = 99;

type NavigatorWithBadging = Navigator & {
    setAppBadge?: (contents?: number) => Promise<void>;
    clearAppBadge?: () => Promise<void>;
};

/**
 * Updates the app icon badge with unread mention count (Badging API).
 * Only has effect when running as installed PWA in supporting browsers.
 * @param count - Number of unread mentions (0 clears the badge)
 */
export const updateAppBadge = (count: number): void => {
    if (!isPWA()) {
        return;
    }
    const nav = navigator as NavigatorWithBadging;
    if (!nav.setAppBadge) {
        return;
    }

    const badgeCount = Math.min(Math.max(0, Math.floor(count)), MAX_BADGE_COUNT);

    try {
        if (badgeCount > 0) {
            void nav.setAppBadge(badgeCount);
        } else if (nav.clearAppBadge) {
            void nav.clearAppBadge();
        } else {
            void nav.setAppBadge(0);
        }
    } catch (e) {
        if (process.env.NODE_ENV === 'development') {
            console.warn('Failed to update app badge:', e);
        }
    }
};
