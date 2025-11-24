// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';

import SectionNotice from 'components/section_notice';

export default function NotificationPermissionDeniedSectionNotice() {
    const intl = useIntl();

    return (
        <div className='extraContentBeforeSettingList'>
            <SectionNotice
                type='danger'
                title={intl.formatMessage({
                    id: 'user.settings.notifications.desktopAndMobile.notificationSection.permissionDenied.title',
                    defaultMessage: 'Browser notification permission was denied',
                })}
                text={intl.formatMessage({
                    id: 'user.settings.notifications.desktopAndMobile.notificationSection.permissionDenied.message',
                    defaultMessage: 'You\'re missing important message and call notifications from Stroichat. To start receiving notifications, please enable notifications for Stroichat in your browser settings.',
                })}
            />
        </div>
    );
}
