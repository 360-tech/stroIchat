// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';

import type {UserProfile} from '@mattermost/types/users';

import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {displayUsername, isPartner} from 'mattermost-redux/utils/user_utils';

import PartnerTag from 'components/widgets/tag/partner_tag';

type Props = {
    dmUser?: UserProfile;
}

const ChannelHeaderTitleDirect = ({
    dmUser,
}: Props) => {
    const currentUser = useSelector(getCurrentUser);
    const teammateNameDisplaySetting = useSelector(getTeammateNameDisplaySetting);
    const displayName = displayUsername(dmUser, teammateNameDisplaySetting);

    return (
        <>
            {currentUser.id !== dmUser?.id && displayName + ' '}
            {currentUser.id === dmUser?.id &&
                <FormattedMessage
                    id='channel_header.directchannel.you'
                    defaultMessage='{displayName} (you) '
                    values={{displayName}}
                />}
            {isPartner(dmUser?.roles ?? '') && <PartnerTag/>}
        </>
    );
};

export default memo(ChannelHeaderTitleDirect);
