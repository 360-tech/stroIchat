// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {
    Limits,
} from '@mattermost/types/cloud';
import type {GlobalState} from '@mattermost/types/store';

export function getCloudLimits(state: GlobalState): Limits {
    return state.entities.cloud.limits.limits;
}
