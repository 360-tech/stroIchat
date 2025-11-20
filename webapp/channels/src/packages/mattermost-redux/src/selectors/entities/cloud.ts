// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {
    Limits,
    Product,
    CloudState,
} from '@mattermost/types/cloud';
import type {GlobalState} from '@mattermost/types/store';

export function getCloudLimits(state: GlobalState): Limits {
    return state.entities.cloud.limits.limits;
}

export function getCloudLimitsLoaded(state: GlobalState): boolean {
    return state.entities.cloud.limits.limitsLoaded;
}

export function getCloudErrors(state: GlobalState): CloudState['errors'] {
    return state.entities.cloud.errors;
}

export function getSubscriptionProduct(state: GlobalState): Product | undefined {
    return undefined;
}

export function getSubscriptionProductName(state: GlobalState): string {
    return getSubscriptionProduct(state)?.name || '';
}

export function checkHadPriorTrial(state: GlobalState): boolean {
    return false;
}
