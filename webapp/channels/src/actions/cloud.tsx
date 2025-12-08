// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ServerError} from '@mattermost/types/errors';

import {CloudTypes} from 'mattermost-redux/action_types';
import {Client4} from 'mattermost-redux/client';

import type {ThunkActionFunc} from 'types/store';

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

export function getCloudLimits(): ThunkActionFunc<Promise<boolean | ServerError>> {
    return async (dispatch) => {
        try {
            dispatch({
                type: CloudTypes.CLOUD_LIMITS_REQUEST,
            });
            const result = await Client4.getCloudLimits();
            if (result) {
                dispatch({
                    type: CloudTypes.RECEIVED_CLOUD_LIMITS,
                    data: result,
                });
            }
        } catch (error) {
            dispatch({
                type: CloudTypes.CLOUD_LIMITS_FAILED,
            });
            return error;
        }
        return true;
    };
}
