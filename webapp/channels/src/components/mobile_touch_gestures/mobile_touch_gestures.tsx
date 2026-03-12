// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {close as closeLhs, open as openLhs, setDragOffset} from 'actions/views/lhs';
import {closeRightHandSide} from 'actions/views/rhs';
import {getIsLhsOpen} from 'selectors/lhs';
import {getIsRhsOpen} from 'selectors/rhs';
import {getIsMobileView} from 'selectors/views/browser';

const getLhsSidebarWidthPx = () => {
    if (typeof window === 'undefined') {
        return 290;
    }

    const width = window.innerWidth;

    if (width <= 320) {
        return 220;
    }

    if (width <= 480) {
        return 260;
    }

    return 290;
};
const EDGE_SWIPE_ZONE_PX = 24;
const OPEN_CLOSE_THRESHOLD_PX = 120;

/**
 * Listens for touch gestures on mobile/PWA: LHS open/close (with drag follow-through),
 * and RHS (thread) close on swipe right.
 */
export const MobileTouchGestures = (): null => {
    const dispatch = useDispatch();
    const isMobileView = useSelector(getIsMobileView);
    const isLhsOpen = useSelector(getIsLhsOpen);
    const isRhsOpen = useSelector(getIsRhsOpen);

    const gestureRef = useRef<{ type: 'open' | 'close' | 'closeRhs'; startX: number } | null>(null);
    const lastOffsetRef = useRef(0);

    useEffect(() => {
        if (!isMobileView) {
            return undefined;
        }

        const LHS_SIDEBAR_WIDTH_PX = getLhsSidebarWidthPx();

        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length !== 1) {
                return;
            }
            const touch = e.touches[0];
            const x = touch.clientX;

            if (isRhsOpen) {
                gestureRef.current = {type: 'closeRhs', startX: x};
                lastOffsetRef.current = 0;
            } else if (!isLhsOpen && x < EDGE_SWIPE_ZONE_PX) {
                gestureRef.current = {type: 'open', startX: x};
                lastOffsetRef.current = 0;
            } else if (isLhsOpen) {
                gestureRef.current = {type: 'close', startX: x};
                lastOffsetRef.current = LHS_SIDEBAR_WIDTH_PX;
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            const g = gestureRef.current;
            if (!g || e.touches.length !== 1) {
                return;
            }
            e.preventDefault();
            const touch = e.touches[0];
            const deltaX = touch.clientX - g.startX;

            if (g.type === 'open') {
                const offset = Math.max(0, Math.min(deltaX, LHS_SIDEBAR_WIDTH_PX));
                lastOffsetRef.current = offset;
                dispatch(setDragOffset(offset));
            } else if (g.type === 'close') {
                const offset = Math.max(0, Math.min(LHS_SIDEBAR_WIDTH_PX + deltaX, LHS_SIDEBAR_WIDTH_PX));
                lastOffsetRef.current = offset;
                dispatch(setDragOffset(offset));
            } else {
                lastOffsetRef.current = deltaX;
            }
        };

        const handleTouchEnd = () => {
            const g = gestureRef.current;
            if (!g) {
                return;
            }
            const offset = lastOffsetRef.current;
            if (g.type === 'open') {
                if (offset >= OPEN_CLOSE_THRESHOLD_PX) {
                    dispatch(openLhs());
                }
                dispatch(setDragOffset(0));
            } else if (g.type === 'close') {
                const closedDistance = LHS_SIDEBAR_WIDTH_PX - offset;
                if (closedDistance >= OPEN_CLOSE_THRESHOLD_PX) {
                    dispatch(closeLhs());
                }
                dispatch(setDragOffset(0));
            } else if (offset >= OPEN_CLOSE_THRESHOLD_PX) {
                dispatch(closeRightHandSide());
            }
            gestureRef.current = null;
        };

        const opts: AddEventListenerOptions = {passive: false};
        document.addEventListener('touchstart', handleTouchStart, opts);
        document.addEventListener('touchmove', handleTouchMove, opts);
        document.addEventListener('touchend', handleTouchEnd, opts);
        document.addEventListener('touchcancel', handleTouchEnd, opts);

        return () => {
            document.removeEventListener('touchstart', handleTouchStart, opts);
            document.removeEventListener('touchmove', handleTouchMove, opts);
            document.removeEventListener('touchend', handleTouchEnd, opts);
            document.removeEventListener('touchcancel', handleTouchEnd, opts);
            if (gestureRef.current) {
                const gt = gestureRef.current.type;
                if (gt === 'open' || gt === 'close') {
                    dispatch(setDragOffset(0));
                }
                gestureRef.current = null;
            }
        };
    }, [isMobileView, isLhsOpen, isRhsOpen, dispatch]);

    return null;
};

export default MobileTouchGestures;
