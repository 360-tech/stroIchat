// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {TeamTypes} from 'mattermost-redux/action_types';

import lhsReducer from 'reducers/views/lhs';

import {ActionTypes} from 'utils/constants';

describe('Reducers.LHS', () => {
    const initialState = {
        isOpen: false,
        currentStaticPageId: '',
        size: 'medium',
        dragOffset: 0,
    };

    test('initial state', () => {
        const nextState = lhsReducer(
            {
                isOpen: false,
                currentStaticPageId: '',
                size: 'medium',
                dragOffset: 0,
            },
            {type: 'testinit'},
        );

        expect(nextState).toEqual(initialState);
    });

    test(`should close on ${ActionTypes.TOGGLE_LHS}`, () => {
        const nextState = lhsReducer(
            {
                isOpen: true,
                currentStaticPageId: '',
                size: 'medium',
                dragOffset: 0,
            },
            {
                type: ActionTypes.TOGGLE_LHS,
            },
        );

        expect(nextState).toEqual({
            ...initialState,
            isOpen: false,
        });
    });

    test(`should open on ${ActionTypes.TOGGLE_LHS}`, () => {
        const nextState = lhsReducer(
            {
                isOpen: false,
                currentStaticPageId: '',
                size: 'medium',
                dragOffset: 0,
            },
            {
                type: ActionTypes.TOGGLE_LHS,
            },
        );

        expect(nextState).toEqual({
            ...initialState,
            isOpen: true,
        });
    });

    test(`should open on ${ActionTypes.OPEN_LHS}`, () => {
        const nextState = lhsReducer(
            {
                isOpen: false,
                currentStaticPageId: '',
                size: 'medium',
                dragOffset: 0,
            },
            {
                type: ActionTypes.OPEN_LHS,
            },
        );

        expect(nextState).toEqual({
            ...initialState,
            isOpen: true,
        });
    });

    test(`should close on ${ActionTypes.CLOSE_LHS}`, () => {
        const nextState = lhsReducer(
            {
                isOpen: true,
                currentStaticPageId: '',
                size: 'medium',
                dragOffset: 0,
            },
            {
                type: ActionTypes.CLOSE_LHS,
            },
        );

        expect(nextState).toEqual({
            ...initialState,
            isOpen: false,
        });
    });

    test(`should set dragOffset and reset on open/close`, () => {
        const withDrag = lhsReducer(
            initialState as Parameters<typeof lhsReducer>[0],
            {type: ActionTypes.SET_LHS_DRAG_OFFSET, data: 100},
        );
        expect(withDrag).toMatchObject({dragOffset: 100});

        const afterOpen = lhsReducer(
            withDrag as Parameters<typeof lhsReducer>[0],
            {type: ActionTypes.OPEN_LHS},
        );
        expect(afterOpen).toMatchObject({dragOffset: 0});
    });

    describe('should close', () => {
        [
            ActionTypes.TOGGLE_RHS_MENU,
            ActionTypes.OPEN_RHS_MENU,
            TeamTypes.SELECT_TEAM,
        ].forEach((action) => {
            it(`on ${action}`, () => {
                const nextState = lhsReducer(
                    {
                        isOpen: true,
                        currentStaticPageId: '',
                        size: 'medium',
                        dragOffset: 0,
                    },
                    {
                        type: action,
                    },
                );

                expect(nextState).toEqual({
                    ...initialState,
                    isOpen: false,
                });
            });
        });
    });
});
