// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export const checkboxesTitleToIdMap = {
    ALL_USERS_MANAGE_PUBLIC_CHANNEL_MEMBERS: 'all_users-public_channel-manage_public_channel_members_and_read_groups-checkbox',
    ALL_USERS_MANAGE_PRIVATE_CHANNEL_MEMBERS: 'all_users-private_channel-manage_private_channel_members_and_read_groups-checkbox',
    ALL_USERS_MANAGE_OAUTH_APPLICATIONS: 'all_users-integrations-manage_oauth-checkbox',
    CREATE_POSTS_GUESTS: 'create_post-partners',
    CREATE_POSTS_MEMBERS: 'create_post-members',
    POST_REACTIONS_GUESTS: 'create_reactions-partners',
    POST_REACTIONS_MEMBERS: 'create_reactions-members',
    MANAGE_MEMBERS_GUESTS: 'manage_members-partners',
    MANAGE_MEMBERS_MEMBERS: 'manage_members-members',
    CHANNEL_MENTIONS_MEMBERS: 'use_channel_mentions-members',
    CHANNEL_MENTIONS_GUESTS: 'use_channel_mentions-partners',
};

export const checkBoxes = [
    checkboxesTitleToIdMap.CREATE_POSTS_GUESTS,
    checkboxesTitleToIdMap.CREATE_POSTS_MEMBERS,
    checkboxesTitleToIdMap.POST_REACTIONS_GUESTS,
    checkboxesTitleToIdMap.POST_REACTIONS_MEMBERS,
    checkboxesTitleToIdMap.MANAGE_MEMBERS_MEMBERS,
    checkboxesTitleToIdMap.CHANNEL_MENTIONS_GUESTS,
    checkboxesTitleToIdMap.CHANNEL_MENTIONS_MEMBERS,
];
