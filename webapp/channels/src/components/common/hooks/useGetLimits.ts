// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useMemo} from 'react';
import {useSelector} from 'react-redux';

import type {Limits} from '@mattermost/types/cloud';

import {getCloudLimits} from 'mattermost-redux/selectors/entities/cloud';

const cloudLimitsReceived = false;
export default function useGetLimits(): [Limits, boolean] {
    const cloudLimits = useSelector(getCloudLimits);

    const result: [Limits, boolean] = useMemo(() => {
        return [cloudLimits, cloudLimitsReceived];
    }, [cloudLimits]);
    return result;
}
