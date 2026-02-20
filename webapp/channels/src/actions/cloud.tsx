// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Client4} from 'mattermost-redux/client';

export function getInstallation() {
    return async () => {
        try {
            const installation = await Client4.getInstallation();
            return {data: installation};
        } catch (e: any) {
            return {error: e.message};
        }
    };
}
