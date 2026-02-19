// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ServerChannel} from '@mattermost/types/channels';

import {ChannelTypes} from 'mattermost-redux/action_types';

import messageCountsReducer, {updateMessageCount} from './message_counts';

describe('reducers.entities.channels', () => {
    describe('updateMessageCounts', () => {
        it('root and total should be different if there are threads', () => {
            const state = {
                myid: {
                    total: 0,
                    root: 0,
                },
            };
            const channel = {
                id: 'myid',
                total_msg_count_root: 1,
                total_msg_count: 5,
            };
            const results = updateMessageCount(state, channel as ServerChannel);
            expect(results.myid.root).toBe(1);
            expect(results.myid.total).toBe(5);
        });
    });

    describe('messageCounts', () => {
        it('INCREMENT_TOTAL_MSG_COUNT creates entry when channel has no existing messageCount', () => {
            const state = {};
            const action = {
                type: ChannelTypes.INCREMENT_TOTAL_MSG_COUNT,
                data: {
                    channelId: 'new-channel-id',
                    amount: 1,
                    amountRoot: 1,
                },
            };
            const result = messageCountsReducer(state, action);
            expect(result['new-channel-id']).toEqual({root: 1, total: 1});
        });
    });
});
