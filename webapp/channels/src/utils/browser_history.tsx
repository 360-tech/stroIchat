// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createBrowserHistory} from 'history';
import type {History} from 'history';

import {getModule} from 'module_registry';

const b = createBrowserHistory({basename: window.basename});
const browserHistory = {
    ...b,
    push: (path: string | { pathname: string }, ...args: string[]) => {
        b.push(path, ...args);
    },
};

/**
 * Returns the current history object.
 *
 * If you're calling this from within a React component, consider using the useHistory hook from react-router-dom.
 */
export function getHistory() {
    return getModule<History>('utils/browser_history') ?? browserHistory;
}
