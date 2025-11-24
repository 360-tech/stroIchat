// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';

import SectionNotice from 'components/section_notice';

export default function NotificationPermissionUnsupportedSectionNotice() {
    const intl = useIntl();

    return (
        <div className='extraContentBeforeSettingList'>
            <SectionNotice
                type='danger'
                title={intl.formatMessage({
                    id: 'user.settings.notifications.desktopAndMobile.notificationSection.permissionUnsupported.title',
                    defaultMessage: 'Browser notifications unsupported',
                })}
                text={intl.formatMessage({
                    id: 'user.settings.notifications.desktopAndMobile.notificationSection.permissionUnsupported.message',
                    defaultMessage: 'You\'re missing important message and call notifications from Stroichat. To start receiving notifications, please update to a supported browser.',
                })}
            />
        </div>
    );
}

