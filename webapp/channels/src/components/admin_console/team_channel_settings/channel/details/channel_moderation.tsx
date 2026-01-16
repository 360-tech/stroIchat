// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import isNil from 'lodash/isNil';
import React from 'react';
import {FormattedMessage, defineMessages} from 'react-intl';
import type {MessageDescriptor} from 'react-intl';

import type {ChannelModeration as ChannelPermissions} from '@mattermost/types/channels';

import {Permissions, Roles} from 'mattermost-redux/constants';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import AdminPanel from 'components/widgets/admin_console/admin_panel';
import CheckboxCheckedIcon from 'components/widgets/icons/checkbox_checked_icon';

import type {ChannelModerationRoles} from './types';

const PERIOD_TO_SLASH_REGEX = /\./g;

const MEMBERS_CAN_CREATE_POST_PERMISSION = 'create_post';
const PARTNERS_CAN_CREATE_POST_PERMISSION = 'partner_create_post';
const MEMBERS_CAN_POST_REACTIONS_PERMISSION = 'reactions';
const PARTNERS_CAN_POST_REACTIONS_PERMISSION = 'partner_reactions';
const MEMBERS_CAN_MANAGE_CHANNEL_MEMBERS_PERMISSION = 'manage_{public_or_private}_channel_members';
const PARTNERS_CAN_MANAGE_CHANNEL_MEMBERS_PERMISSION = 'partner_manage_{public_or_private}_channel_members';
const MEMBERS_CAN_USE_CHANNEL_MENTIONS_PERMISSION = 'use_channel_mentions';
const PARTNERS_CAN_USE_CHANNEL_MENTIONS_PERMISSION = 'partner_use_channel_mentions';
const MEMBERS_CAN_MANAGE_CHANNEL_BOOKMARKS_PERMISSION = 'manage_{public_or_private}_channel_bookmarks';
const PARTNERS_CAN_MANAGE_CHANNEL_BOOKMARKS_PERMISSION = 'partner_manage_{public_or_private}_channel_bookmarks';

function getChannelModerationPermissionNames(permission: string) {
    if (permission === Permissions.CHANNEL_MODERATED_PERMISSIONS.CREATE_POST) {
        return {
            disabledPartners: PARTNERS_CAN_CREATE_POST_PERMISSION,
            disabledMembers: MEMBERS_CAN_CREATE_POST_PERMISSION,
            disabledBoth: MEMBERS_CAN_CREATE_POST_PERMISSION,
        };
    }

    if (permission === Permissions.CHANNEL_MODERATED_PERMISSIONS.CREATE_REACTIONS) {
        return {
            disabledPartners: PARTNERS_CAN_POST_REACTIONS_PERMISSION,
            disabledMembers: MEMBERS_CAN_POST_REACTIONS_PERMISSION,
            disabledBoth: MEMBERS_CAN_POST_REACTIONS_PERMISSION,
        };
    }

    if (permission === Permissions.CHANNEL_MODERATED_PERMISSIONS.MANAGE_MEMBERS) {
        return {
            disabledPartners: PARTNERS_CAN_MANAGE_CHANNEL_MEMBERS_PERMISSION,
            disabledMembers: MEMBERS_CAN_MANAGE_CHANNEL_MEMBERS_PERMISSION,
            disabledBoth: MEMBERS_CAN_MANAGE_CHANNEL_MEMBERS_PERMISSION,
        };
    }

    if (permission === Permissions.CHANNEL_MODERATED_PERMISSIONS.USE_CHANNEL_MENTIONS) {
        return {
            disabledPartners: PARTNERS_CAN_USE_CHANNEL_MENTIONS_PERMISSION,
            disabledMembers: MEMBERS_CAN_USE_CHANNEL_MENTIONS_PERMISSION,
            disabledBoth: MEMBERS_CAN_USE_CHANNEL_MENTIONS_PERMISSION,
        };
    }

    if (permission === Permissions.CHANNEL_MODERATED_PERMISSIONS.MANAGE_BOOKMARKS) {
        return {
            disabledPartners: PARTNERS_CAN_MANAGE_CHANNEL_BOOKMARKS_PERMISSION,
            disabledMembers: MEMBERS_CAN_MANAGE_CHANNEL_BOOKMARKS_PERMISSION,
            disabledBoth: MEMBERS_CAN_MANAGE_CHANNEL_BOOKMARKS_PERMISSION,
        };
    }

    return null;
}

function getChannelModerationRowsMessages(permission: string): Record<string, MessageDescriptor> | null {
    const createPostRowMessages = defineMessages({
        title: {
            id: 'admin.channel_settings.channel_moderation.createPosts',
            defaultMessage: 'Create Posts',
        },
        description: {
            id: 'admin.channel_settings.channel_moderation.createPostsDesc',
            defaultMessage: 'The ability for members and partners to create posts in the channel.',
        },
        descriptionMembers: {
            id: 'admin.channel_settings.channel_moderation.createPostsDescMembers',
            defaultMessage: 'The ability for members to create posts in the channel.',
        },
        disabledPartners: {
            id: 'admin.channel_settings.channel_moderation.createPosts.disabledPartner',
            defaultMessage: 'Create posts for partners are disabled in [{scheme_name}](../permissions/{scheme_link}).',
        },
        disabledMembers: {
            id: 'admin.channel_settings.channel_moderation.createPosts.disabledMember',
            defaultMessage: 'Create posts for members are disabled in [{scheme_name}](../permissions/{scheme_link}).',
        },
        disabledBoth: {
            id: 'admin.channel_settings.channel_moderation.createPosts.disabledBoth',
            defaultMessage: 'Create posts for members and partners are disabled in [{scheme_name}](../permissions/{scheme_link}).',
        },
    });

    const postReactionsRowMessages = defineMessages({
        title: {
            id: 'admin.channel_settings.channel_moderation.postReactions',
            defaultMessage: 'Post Reactions',
        },
        description: {
            id: 'admin.channel_settings.channel_moderation.postReactionsDesc',
            defaultMessage: 'The ability for members and partners to post reactions.',
        },
        descriptionMembers: {
            id: 'admin.channel_settings.channel_moderation.postReactionsDescMembers',
            defaultMessage: 'The ability for members to post reactions.',
        },
        disabledPartners: {
            id: 'admin.channel_settings.channel_moderation.postReactions.disabledPartner',
            defaultMessage: 'Post reactions for partners are disabled in [{scheme_name}](../permissions/{scheme_link}).',
        },
        disabledMembers: {
            id: 'admin.channel_settings.channel_moderation.postReactions.disabledMember',
            defaultMessage: 'Post reactions for members are disabled in [{scheme_name}](../permissions/{scheme_link}).',
        },
        disabledBoth: {
            id: 'admin.channel_settings.channel_moderation.postReactions.disabledBoth',
            defaultMessage: 'Post reactions for members and partners are disabled in [{scheme_name}](../permissions/{scheme_link}).',
        },
    });

    const manageMembersRowMessages = defineMessages({
        title: {
            id: 'admin.channel_settings.channel_moderation.manageMembers',
            defaultMessage: 'Manage Members',
        },
        description: {
            id: 'admin.channel_settings.channel_moderation.manageMembersDesc',
            defaultMessage: 'The ability for members to add and remove people.',
        },
        disabledPartners: {
            id: 'admin.channel_settings.channel_moderation.manageMembers.disabledPartner',
            defaultMessage: 'Manage members for partners are disabled in [{scheme_name}](../permissions/{scheme_link}).',
        },
        disabledMembers: {
            id: 'admin.channel_settings.channel_moderation.manageMembers.disabledMember',
            defaultMessage: 'Manage members for members are disabled in [{scheme_name}](../permissions/{scheme_link}).',
        },
        disabledBoth: {
            id: 'admin.channel_settings.channel_moderation.manageMembers.disabledBoth',
            defaultMessage: 'Manage members for members and partners are disabled in [{scheme_name}](../permissions/{scheme_link}).',
        },
    });

    const channelMentionsRowMessages = defineMessages({
        title: {
            id: 'admin.channel_settings.channel_moderation.channelMentions',
            defaultMessage: 'Channel Mentions',
        },
        description: {
            id: 'admin.channel_settings.channel_moderation.channelMentionsDesc',
            defaultMessage: 'The ability for members and partners to use @all, @here and @channel.',
        },
        descriptionMembers: {
            id: 'admin.channel_settings.channel_moderation.channelMentionsDescMembers',
            defaultMessage: 'The ability for members to use @all, @here and @channel.',
        },
        disabledPartners: {
            id: 'admin.channel_settings.channel_moderation.channelMentions.disabledPartner',
            defaultMessage: 'Channel mentions for partners are disabled in [{scheme_name}](../permissions/{scheme_link}).',
        },
        disabledMembers: {
            id: 'admin.channel_settings.channel_moderation.channelMentions.disabledMember',
            defaultMessage: 'Channel mentions for members are disabled in [{scheme_name}](../permissions/{scheme_link}).',
        },
        disabledBoth: {
            id: 'admin.channel_settings.channel_moderation.channelMentions.disabledBoth',
            defaultMessage: 'Channel mentions for members and partners are disabled in [{scheme_name}](../permissions/{scheme_link}).',
        },
        disabledPartnersDueToCreatePosts: {
            id: 'admin.channel_settings.channel_moderation.channelMentions.disabledPartnersDueToCreatePosts',
            defaultMessage: 'Partners can not use channel mentions without the ability to create posts.',
        },
        disabledMembersDueToCreatePosts: {
            id: 'admin.channel_settings.channel_moderation.channelMentions.disabledMemberDueToCreatePosts',
            defaultMessage: 'Members can not use channel mentions without the ability to create posts.',
        },
        disabledBothDueToCreatePosts: {
            id: 'admin.channel_settings.channel_moderation.channelMentions.disabledBothDueToCreatePosts',
            defaultMessage: 'Partners and members can not use channel mentions without the ability to create posts.',
        },
    });

    const manageBookmarksRowMessages = defineMessages({
        title: {
            id: 'admin.channel_settings.channel_moderation.manageBookmarks',
            defaultMessage: 'Manage Bookmarks',
        },
        description: {
            id: 'admin.channel_settings.channel_moderation.manageBookmarksDesc',
            defaultMessage: 'The ability for members and partners to add, delete and sort bookmarks.',
        },
        disabledPartners: {
            id: 'admin.channel_settings.channel_moderation.manageBookmarks.disabledPartner',
            defaultMessage: 'Manage bookmarks for partners are disabled in [{scheme_name}](../permissions/{scheme_link}).',
        },
        disabledMembers: {
            id: 'admin.channel_settings.channel_moderation.manageBookmarks.disabledMember',
            defaultMessage: 'Manage bookmarks for members are disabled in [{scheme_name}](../permissions/{scheme_link}).',
        },
        disabledBoth: {
            id: 'admin.channel_settings.channel_moderation.manageBookmarks.disabledBoth',
            defaultMessage: 'Manage bookmarks for members and partners are disabled in [{scheme_name}](../permissions/{scheme_link}).',
        },
    });

    if (permission === Permissions.CHANNEL_MODERATED_PERMISSIONS.CREATE_POST) {
        return createPostRowMessages;
    }

    if (permission === Permissions.CHANNEL_MODERATED_PERMISSIONS.CREATE_REACTIONS) {
        return postReactionsRowMessages;
    }

    if (permission === Permissions.CHANNEL_MODERATED_PERMISSIONS.MANAGE_MEMBERS) {
        return manageMembersRowMessages;
    }

    if (permission === Permissions.CHANNEL_MODERATED_PERMISSIONS.USE_CHANNEL_MENTIONS) {
        return channelMentionsRowMessages;
    }

    if (permission === Permissions.CHANNEL_MODERATED_PERMISSIONS.MANAGE_BOOKMARKS) {
        return manageBookmarksRowMessages;
    }

    return null;
}

const channelModerationHeaderMessages = defineMessages({
    titleMessage: {
        id: 'admin.channel_settings.channel_moderation.title',
        defaultMessage: 'Advanced Access Control',
    },
    subtitleMessageForMembersAndPartners: {
        id: 'admin.channel_settings.channel_moderation.subtitle',
        defaultMessage: 'Manage the actions available to channel members and partners.',
    },
    subtitleMessageForMembers: {
        id: 'admin.channel_settings.channel_moderation.subtitleMembers',
        defaultMessage: 'Manage the actions available to channel members.',
    },
});

interface ChannelModerationTableRow {
    name: string;
    partners: boolean;
    members: boolean;
    partnersDisabled?: boolean;
    membersDisabled: boolean;
    onClick: (name: string, channelRole: ChannelModerationRoles) => void;
    errorMessages?: any;
    partnerAccountsEnabled: boolean;
    readOnly?: boolean;
}

export const ChannelModerationTableRow = (props: ChannelModerationTableRow) => {
    const channelModerationPermissionMessages = getChannelModerationRowsMessages(props.name);
    let descriptionId = channelModerationPermissionMessages?.description.id;
    let descriptionDefaultMessage = channelModerationPermissionMessages?.description.defaultMessage;
    if (!props.partnerAccountsEnabled && channelModerationPermissionMessages?.descriptionMembers) {
        descriptionId = channelModerationPermissionMessages.descriptionMembers?.id ?? '';
        descriptionDefaultMessage = channelModerationPermissionMessages?.descriptionMembers?.defaultMessage ?? '';
    }
    return (
        <tr>
            <td>
                <div
                    className='as-bs-label'
                    data-testid={channelModerationPermissionMessages?.title?.id?.replace(PERIOD_TO_SLASH_REGEX, '-')}
                >
                    <FormattedMessage
                        id={channelModerationPermissionMessages?.title?.id}
                        defaultMessage={channelModerationPermissionMessages?.title?.defaultMessage}
                    />
                </div>
                <div
                    data-testid={channelModerationPermissionMessages?.description?.id?.replace(PERIOD_TO_SLASH_REGEX, '-')}
                >
                    <FormattedMessage
                        id={descriptionId}
                        defaultMessage={descriptionDefaultMessage}
                    />
                </div>
                {props.errorMessages}
            </td>
            {props.partnerAccountsEnabled &&
                <td>
                    {!isNil(props.partners) &&
                        <button
                            type='button'
                            data-testid={`${props.name}-${Roles.PARTNERS}`}
                            className={classNames(
                                'checkbox',
                                {
                                    checked: props.partners && !props.partnersDisabled,
                                    disabled: props.partnersDisabled,
                                },
                            )}
                            onClick={() => props.onClick(props.name, Roles.PARTNERS as ChannelModerationRoles)}
                            disabled={props.partnersDisabled || props.readOnly}
                        >
                            {props.partners && !props.partnersDisabled && <CheckboxCheckedIcon/>}
                        </button>
                    }
                </td>
            }
            <td>
                {!isNil(props.members) &&
                    <button
                        type='button'
                        data-testid={`${props.name}-${Roles.MEMBERS}`}
                        className={classNames(
                            'checkbox',
                            {
                                checked: props.members && !props.membersDisabled,
                                disabled: props.membersDisabled,
                            },
                        )}
                        onClick={() => props.onClick(props.name, Roles.MEMBERS as ChannelModerationRoles)}
                        disabled={props.membersDisabled || props.readOnly}
                    >
                        {props.members && !props.membersDisabled && <CheckboxCheckedIcon/>}
                    </button>
                }
            </td>
        </tr>
    );
};

interface Props {
    channelPermissions?: ChannelPermissions[];
    onChannelPermissionsChanged: (name: string, channelRole: ChannelModerationRoles) => void;
    teamSchemeID?: string;
    teamSchemeDisplayName?: string;
    partnerAccountsEnabled: boolean;
    isPublic: boolean;
    readOnly?: boolean;
}

export default class ChannelModeration extends React.PureComponent<Props> {
    private errorMessagesToDisplay = (entry: ChannelPermissions): JSX.Element[] => {
        const channelModerationPermissionMessages = getChannelModerationRowsMessages(entry.name);

        const errorMessages: JSX.Element[] = [];
        const isPartnersDisabled = !isNil(entry.roles.partners.enabled) && !entry.roles.partners.enabled && this.props.partnerAccountsEnabled;
        const isMembersDisabled = !entry.roles.members.enabled;
        let createPostsKey = '';
        if (entry.name === Permissions.CHANNEL_MODERATED_PERMISSIONS.USE_CHANNEL_MENTIONS) {
            const createPostsObject = this.props.channelPermissions && this.props.channelPermissions!.find((permission) => permission.name === Permissions.CHANNEL_MODERATED_PERMISSIONS.CREATE_POST);
            if (!createPostsObject!.roles.partners!.value && this.props.partnerAccountsEnabled && !createPostsObject!.roles.members!.value) {
                errorMessages.push(
                    <div
                        data-testid={channelModerationPermissionMessages?.disabledBothDueToCreatePosts?.id?.replace(PERIOD_TO_SLASH_REGEX, '-')}
                        key={channelModerationPermissionMessages?.disabledBothDueToCreatePosts?.id}
                    >
                        <FormattedMessage
                            id={channelModerationPermissionMessages?.disabledBothDueToCreatePosts?.id}
                            defaultMessage={channelModerationPermissionMessages?.disabledBothDueToCreatePosts?.defaultMessage}
                        />
                    </div>,
                );
                return errorMessages;
            } else if (!createPostsObject!.roles.partners!.value && this.props.partnerAccountsEnabled) {
                createPostsKey = 'disabledPartnersDueToCreatePosts';
                errorMessages.push(
                    <div
                        data-testid={channelModerationPermissionMessages?.disabledPartnersDueToCreatePosts?.id?.replace(PERIOD_TO_SLASH_REGEX, '-')}
                        key={channelModerationPermissionMessages?.disabledPartnersDueToCreatePosts?.id}
                    >
                        <FormattedMessage
                            id={channelModerationPermissionMessages?.disabledPartnersDueToCreatePosts?.id}
                            defaultMessage={channelModerationPermissionMessages?.disabledPartnersDueToCreatePosts?.defaultMessage}
                        />
                    </div>,
                );
            } else if (!createPostsObject!.roles.members!.value) {
                createPostsKey = 'disabledMembersDueToCreatePosts';
                errorMessages.push(
                    <div
                        data-testid={channelModerationPermissionMessages?.disabledMembersDueToCreatePosts?.id?.replace(PERIOD_TO_SLASH_REGEX, '-')}
                        key={channelModerationPermissionMessages?.disabledMembersDueToCreatePosts?.id}
                    >
                        <FormattedMessage
                            id={channelModerationPermissionMessages?.disabledMembersDueToCreatePosts?.id}
                            defaultMessage={channelModerationPermissionMessages?.disabledMembersDueToCreatePosts?.defaultMessage}
                        />
                    </div>,
                );
            }
        }

        let disabledKey;
        let disabledKeyId;
        let disabledKeyMessage;
        let schemeName = 'System Scheme';
        let schemeLink = 'system_scheme';

        if (this.props.teamSchemeID) {
            schemeName = this.props?.teamSchemeDisplayName + ' Team Scheme';
            schemeLink = `team_override_scheme/${this.props.teamSchemeID}`;
        }

        const permissionName = getChannelModerationPermissionNames(entry.name);

        if (isPartnersDisabled && isMembersDisabled && errorMessages.length <= 0) {
            disabledKey = 'disabledBoth';
            if (permissionName?.disabledBoth) {
                schemeLink += `?rowIdFromQuery=${permissionName.disabledBoth}`;
                if (schemeLink.includes('{public_or_private}')) {
                    const publicOrPrivate = this.props.isPublic ? 'public' : 'private';
                    schemeLink = schemeLink.replace('{public_or_private}', publicOrPrivate);
                }
            }
            disabledKeyId = channelModerationPermissionMessages?.disabledBoth?.id;
            disabledKeyMessage = channelModerationPermissionMessages?.disabledBoth?.defaultMessage;
        } else if (isPartnersDisabled && createPostsKey !== 'disabledPartnersDueToCreatePosts') {
            disabledKey = 'disabledPartners';
            if (permissionName?.disabledPartners) {
                schemeLink += `?rowIdFromQuery=${permissionName.disabledPartners}`;
                if (schemeLink.includes('{public_or_private}')) {
                    const publicOrPrivate = this.props.isPublic ? 'public' : 'private';
                    schemeLink = schemeLink.replace('{public_or_private}', publicOrPrivate);
                }
            }
            disabledKeyId = channelModerationPermissionMessages?.disabledPartners?.id;
            disabledKeyMessage = channelModerationPermissionMessages?.disabledPartners?.defaultMessage;
        } else if (isMembersDisabled && createPostsKey !== 'disabledMembersDueToCreatePosts') {
            disabledKey = 'disabledMembers';
            if (permissionName?.disabledMembers) {
                schemeLink += `?rowIdFromQuery=${permissionName.disabledMembers}`;
                if (schemeLink.includes('{public_or_private}')) {
                    const publicOrPrivate = this.props.isPublic ? 'public' : 'private';
                    schemeLink = schemeLink.replace('{public_or_private}', publicOrPrivate);
                }
            }
            disabledKeyId = channelModerationPermissionMessages?.disabledMembers?.id;
            disabledKeyMessage = channelModerationPermissionMessages?.disabledMembers?.defaultMessage;
        }

        if (schemeLink.includes('{public_or_private}')) {
            const publicOrPrivate = this.props.isPublic ? 'public' : 'private';
            schemeLink = schemeLink.replace('{public_or_private}', publicOrPrivate);
        }

        if (disabledKey) {
            errorMessages.push(
                <div
                    data-testid={disabledKeyId?.replace(PERIOD_TO_SLASH_REGEX, '-')}
                    key={disabledKeyId}
                >
                    <FormattedMarkdownMessage
                        id={disabledKeyId}
                        defaultMessage={disabledKeyMessage as string}
                        values={{
                            scheme_name: schemeName,
                            scheme_link: schemeLink,
                        }}
                    />
                </div>,
            );
        }
        return errorMessages;
    };

    render = (): JSX.Element => {
        const {channelPermissions, partnerAccountsEnabled, onChannelPermissionsChanged, readOnly} = this.props;
        return (
            <AdminPanel
                id='channel_moderation'
                title={channelModerationHeaderMessages.titleMessage}
                subtitle={
                    partnerAccountsEnabled ?
                        channelModerationHeaderMessages.subtitleMessageForMembersAndPartners :
                        channelModerationHeaderMessages.subtitleMessageForMembers
                }
            >
                <div className='channel-moderation'>
                    <div className='channel-moderation--body'>

                        <table
                            id='channel_moderation_table'
                            className='channel-moderation--table'
                        >
                            <thead>
                                <tr>
                                    <th>
                                        <FormattedMessage
                                            id='admin.channel_settings.channel_moderation.permissions'
                                            defaultMessage='Permissions'
                                        />
                                    </th>
                                    {partnerAccountsEnabled &&
                                        <th>
                                            <FormattedMessage
                                                id='admin.channel_settings.channel_moderation.partners'
                                                defaultMessage='Partners'
                                            />
                                        </th>
                                    }
                                    <th>
                                        <FormattedMessage
                                            id='admin.channel_settings.channel_moderation.members'
                                            defaultMessage='Members'
                                        />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {channelPermissions?.map((entry) => {
                                    return (
                                        <ChannelModerationTableRow
                                            key={entry.name}
                                            name={entry.name}
                                            partners={entry.roles.partners.value}
                                            partnersDisabled={!entry.roles.partners.enabled}
                                            members={entry.roles.members.value}
                                            membersDisabled={!entry.roles.members.enabled}
                                            onClick={onChannelPermissionsChanged}
                                            errorMessages={this.errorMessagesToDisplay(entry)}
                                            partnerAccountsEnabled={partnerAccountsEnabled}
                                            readOnly={readOnly}
                                        />
                                    );
                                })}

                            </tbody>
                        </table>

                    </div>
                </div>
            </AdminPanel>
        );
    };
}
