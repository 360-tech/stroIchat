// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {logError} from 'mattermost-redux/actions/errors';
import {Client4} from 'mattermost-redux/client';

import {getHistory} from 'utils/browser_history';
import {showNotification} from 'utils/notifications';

import type {ActionFuncAsync} from 'types/store';

type NotificationResult = {
    status: string;
    reason?: string;
    data?: string;
}

export function notifyMe(title: string, body: string, channelId: string, teamId: string, silent: boolean, soundName: string, url: string): ActionFuncAsync<NotificationResult> {
    return async (dispatch) => {
        try {
            const result = await dispatch(showNotification({
                title,
                body,
                requireInteraction: false,
                silent,
                onClick: () => {
                    window.focus();
                    getHistory().push(url);
                },
            }));
            return {data: result};
        } catch (error) {
            dispatch(logError(error));
            return {data: {status: 'error', reason: 'notification_api', data: String(error)}};
        }
    };
}

export const sendTestNotification = async () => {
    try {
        const result = await Client4.sendTestNotificaiton();
        return result;
    } catch (error) {
        return error;
    }
};
