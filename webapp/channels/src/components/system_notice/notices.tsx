// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {InformationOutlineIcon} from '@mattermost/compass-icons/components';

import type {Notice} from 'components/system_notice/types';

// Notices are objects with the following fields:
//  - name - string identifier
//  - adminOnly - set to true if only system admins should see this message
//  - icon - the image to display for the notice icon
//  - title - JSX node to display for the notice title
//  - body - JSX node to display for the notice body
//  - allowForget - boolean to allow forget the notice
//  - show - function that check if we need to show the notice
//
// Order is important! The notices at the top are shown first.

const notices: Notice[] = [
    {

        // This notice is marked as viewed by default for new users on the server.
        // Any change on this notice should be handled also in the server side.
        name: 'GMasDM',
        allowForget: true,
        title: (
            <FormattedMessage
                id='system_notice.title.gm_as_dm'
                defaultMessage='Updates to Group Messages'
            />
        ),
        icon: (<InformationOutlineIcon/>),
        body: (
            <FormattedMessage
                id='system_noticy.body.gm_as_dm'
                defaultMessage='You will now be notified for all activity in your group messages along with a notification badge for every new message.{br}{br}You can configure this in notification preferences for each group message.'
                values={{br: (<br/>)}}
            />
        ),
        show: (serverVersion, config, license, analytics, currentChannel) => {
            return currentChannel?.type === 'G';
        },
    },
];

export default notices;
