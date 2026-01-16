// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {MattermostFeatures} from './constants';

// eslint-disable-next-line @typescript-eslint/ban-types
export function mapFeatureIdToTranslation(id: string, formatMessage: Function): string {
    switch (id) {
    case MattermostFeatures.Partner_ACCOUNTS:
        return formatMessage({id: 'webapp.mattermost.feature.partner_accounts', defaultMessage: 'Partner Accounts'});
    case MattermostFeatures.CUSTOM_USER_GROUPS:
        return formatMessage({id: 'webapp.mattermost.feature.custom_user_groups', defaultMessage: 'Custom User groups'});
    case MattermostFeatures.CREATE_MULTIPLE_TEAMS:
        return formatMessage({id: 'webapp.mattermost.feature.create_multiple_teams', defaultMessage: 'Create Multiple Teams'});
    case MattermostFeatures.START_CALL:
        return formatMessage({id: 'webapp.mattermost.feature.start_call', defaultMessage: 'Start call'});
    case MattermostFeatures.UNLIMITED_MESSAGES:
        return formatMessage({id: 'webapp.mattermost.feature.unlimited_messages', defaultMessage: 'Unlimited Messages'});
    case MattermostFeatures.UNLIMITED_FILE_STORAGE:
        return formatMessage({id: 'webapp.mattermost.feature.unlimited_file_storage', defaultMessage: 'Unlimited File Storage'});
    case MattermostFeatures.HIGHLIGHT_WITHOUT_NOTIFICATION:
        return formatMessage({id: 'webapp.mattermost.feature.highlight_without_notification', defaultMessage: 'Keywords Highlight Without Notification'});
    default:
        return '';
    }
}
