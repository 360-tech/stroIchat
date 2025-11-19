// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useSelector} from 'react-redux';

import type {CloudUsage} from '@mattermost/types/cloud';

import {getUsage} from 'mattermost-redux/selectors/entities/usage';

export default function useGetUsage(): CloudUsage {
    const usage = useSelector(getUsage);

    return usage;
}
