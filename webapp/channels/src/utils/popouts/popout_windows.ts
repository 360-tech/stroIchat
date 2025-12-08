// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {IntlShape} from 'react-intl';

export function popoutThread(intl: IntlShape, threadId: string, teamName: string) {
    return popout(
        `/_popout/thread/${teamName}/${threadId}`,
        {
            isRHS: true,
            titleTemplate: intl.formatMessage({id: 'thread_popout.title', defaultMessage: 'Thread - {channelName} - {teamName}'}),
        },
    );
}

/**
 * Below this is generic popout code
 * You likely do not need to add anything below this.
 */

type PopoutListeners = {
    send: (channel: string, ...args: unknown[]) => void;
    message: (listener: (channel: string, ...args: unknown[]) => void) => void;
    closed: (listener: () => void) => void;
};

async function popout(path: string): Promise<Partial<PopoutListeners>> {
// Coming soon: browser popouts
    return Promise.resolve({});
}

export async function sendToParent(channel: string, ...args: unknown[]) {
    // Coming soon: browser popouts
}

export async function onMessageFromParent(listener: (channel: string, ...args: unknown[]) => void) {
    // Coming soon: browser popouts
}

