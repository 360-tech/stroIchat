// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import ChannelHeaderTitleGroup from 'components/channel_header/channel_header_title_group';

import {renderWithContext} from 'tests/react_testing_utils';
import {TestHelper} from 'utils/test_helper';

describe('components/ChannelHeaderTitleGroup', () => {
    const channels = {
        channels: {
            channel_id: {
                id: 'channel_id',
                display_name: 'regular_user, partner_user',
            },
        },
        currentChannelId: 'channel_id',
    };

    const channelsWithoutPartners = {
        channels: {
            channel_id: {
                id: 'channel_id',
                display_name: 'regular_user, not_partner_user',
            },
        },
        currentChannelId: 'channel_id',
    };

    const users = {
        profiles: {
            user_id: {
                id: 'user_id',
                username: 'regular_user',
                roles: 'system_user',
            },
            partner_id: {
                id: 'partner_id',
                username: 'partner_user',
                roles: 'partner_user',
            },
            not_partner_id: {
                id: 'not_partner_id',
                username: 'not_partner_user',
                roles: 'system_user',
            },
        },
        currentUserId: 'user_id',
    };

    test('should render the partner tags on gms', () => {
        const state = {
            entities: {
                channels,
                users,
            },
        };

        const gmMembers = [
            TestHelper.getUserMock({
                id: 'user_id',
                username: 'regular_user',
                roles: 'system_user',
            }),
            TestHelper.getUserMock({
                id: 'partner_id',
                username: 'partner_user',
                roles: 'system_partner',
            }),
        ];

        const wrapper = renderWithContext(
            <ChannelHeaderTitleGroup gmMembers={gmMembers}/>,
            state,
        );
        expect(wrapper.queryAllByText('GUEST').length).toBe(1);
    });

    test('should not render the partner tags on gms when no partner is in it', () => {
        const state = {
            entities: {
                channels: channelsWithoutPartners,
                users,
            },
        };

        const gmMembers = [
            TestHelper.getUserMock({
                id: 'user_id',
                username: 'regular_user',
                roles: 'system_user',
            }),
            TestHelper.getUserMock({
                id: 'not_partner_id',
                username: 'not_partner_user',
                roles: 'system_user',
            }),
        ];

        const wrapper = renderWithContext(
            <ChannelHeaderTitleGroup gmMembers={gmMembers}/>,
            state,
        );
        expect(wrapper.queryAllByText('GUEST').length).toBe(0);
    });
});
