// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useState, useEffect, useMemo} from 'react';
import {useSelector} from 'react-redux';

import type {Limits} from '@mattermost/types/cloud';

import {getSubscriptionProduct, getCloudLimits, getCloudLimitsLoaded} from 'mattermost-redux/selectors/entities/cloud';

export default function useGetLimits(): [Limits, boolean] {
    const cloudLimits = useSelector(getCloudLimits);
    const cloudLimitsReceived = useSelector(getCloudLimitsLoaded);
    const subscriptionProduct = useSelector(getSubscriptionProduct);
    const [requestedLimits, setRequestedLimits] = useState(false);

    useEffect(() => {
        if (subscriptionProduct && requestedLimits) {
            setRequestedLimits(false);
        }
    }, [subscriptionProduct]);

    const result: [Limits, boolean] = useMemo(() => {
        return [cloudLimits, cloudLimitsReceived];
    }, [cloudLimits, cloudLimitsReceived]);
    return result;
}
