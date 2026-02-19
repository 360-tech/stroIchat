// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {defineMessage, defineMessages, useIntl} from 'react-intl';

import {InformationOutlineIcon} from '@mattermost/compass-icons/components';

import WithTooltip from 'components/with_tooltip';

export const messages = defineMessages({
    totalUsers: {id: 'analytics.team.totalUsers', defaultMessage: 'Total Activated Users'},
});

const Title = () => {
    const intl = useIntl();
    return (
        <WithTooltip
            title={defineMessage({id: 'analytics.team.totalUsers.title.tooltip.title', defaultMessage: 'Activated users on this server'})}
            hint={defineMessage({id: 'analytics.team.totalUsers.title.tooltip.hint', defaultMessage: 'Also called Registered Users'})}
        >
            <span>
                {intl.formatMessage(messages.totalUsers)}
                <InformationOutlineIcon size='16'/>
            </span>
        </WithTooltip>
    );
};

export default Title;
