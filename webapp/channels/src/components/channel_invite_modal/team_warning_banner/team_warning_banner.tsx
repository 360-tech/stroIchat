// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {FormattedMessage, FormattedList, useIntl} from 'react-intl';
import {useSelector} from 'react-redux';

import type {GlobalState} from '@mattermost/types/store';
import type {UserProfile} from '@mattermost/types/users';

import {getTeam} from 'mattermost-redux/selectors/entities/teams';

import AlertBanner from 'components/alert_banner';
import AtMention from 'components/at_mention';
import type {Value} from 'components/multiselect/multiselect';
import WithTooltip from 'components/with_tooltip';

type UserProfileValue = Value & UserProfile;

export type Props = {
    teamId: string;
    users: UserProfileValue[];
    partners: UserProfileValue[];
}

const TeamWarningBanner = (props: Props) => {
    const {
        teamId,
        users,
        partners,
    } = props;

    const {formatMessage} = useIntl();

    const team = useSelector((state: GlobalState) => getTeam(state, teamId));

    const getCommaSeparatedUsernames = useCallback((users: Array<UserProfileValue | UserProfile>) => {
        return users.map((user) => {
            return `@${user.username}`;
        }).join(', ');
    }, []);

    const getPartnerMessage = useCallback(() => {
        if (partners.length === 0) {
            return null;
        }

        const commaSeparatedUsernames = getCommaSeparatedUsernames(partners);
        const firstName = partners[0].username;
        if (partners.length > 10) {
            return (
                formatMessage(
                    {
                        id: 'channel_invite.invite_team_members.partners.messageOverflow',
                        defaultMessage: '{firstUser} and {others} are partner users and need to first be invited to the team before you can add them to the channel. Once they\'ve joined the team, you can add them to this channel.',
                    },
                    {
                        firstUser: (
                            <AtMention
                                key={firstName}
                                mentionName={firstName}
                            />
                        ),
                        others: (
                            <WithTooltip
                                title={commaSeparatedUsernames.replace(`@${firstName}, `, '')}
                            >
                                <span
                                    className='add-others-link'
                                >
                                    <FormattedMessage
                                        id='channel_invite.invite_team_members.messageOthers'
                                        defaultMessage='{count} others'
                                        values={{
                                            count: partners.length - 1,
                                        }}
                                    />
                                </span>
                            </WithTooltip>
                        ),
                    },
                )
            );
        }

        const partnersList = partners.map((user) => {
            return (
                <AtMention
                    key={user.username}
                    mentionName={user.username}
                />
            );
        });

        return (
            formatMessage(
                {
                    id: 'channel_invite.invite_team_members.partners.message',
                    defaultMessage: '{count, plural, =1 {{firstUser} is a partner user and needs} other {{users} are partner users and need}} to first be invited to the team before you can add them to the channel. Once they\'ve joined the team, you can add them to this channel.',
                },
                {
                    count: partners.length,
                    users: (<FormattedList value={partnersList}/>),
                    firstUser: (
                        <AtMention
                            key={firstName}
                            mentionName={firstName}
                        />
                    ),
                    team: (<strong>{team?.display_name}</strong>),
                },
            )
        );
    }, [partners, formatMessage, getCommaSeparatedUsernames, team?.display_name]);

    const getMessage = useCallback(() => {
        const commaSeparatedUsernames = getCommaSeparatedUsernames(users);
        const firstName = users[0].username;

        if (users.length > 10) {
            return formatMessage(
                {
                    id: 'channel_invite.invite_team_members.messageOverflow',
                    defaultMessage: 'You can add {firstUser} and {others} to this channel once they are members of the {team} team.',
                },
                {
                    firstUser: (
                        <AtMention
                            key={firstName}
                            mentionName={firstName}
                        />
                    ),
                    others: (
                        <WithTooltip
                            title={commaSeparatedUsernames.replace(`@${firstName}, `, '')}
                        >
                            <span
                                className='add-others-link'
                            >
                                <FormattedMessage
                                    id='channel_invite.invite_team_members.messageOthers'
                                    defaultMessage='{count} others'
                                    values={{
                                        count: users.length - 1,
                                    }}
                                />
                            </span>
                        </WithTooltip>
                    ),
                    team: (<strong>{team?.display_name}</strong>),
                },
            );
        }

        const usersList = users.map((user) => {
            return (
                <AtMention
                    key={user.username}
                    mentionName={user.username}
                />
            );
        });

        return (
            formatMessage(
                {
                    id: 'channel_invite.invite_team_members.message',
                    defaultMessage: 'You can add {count, plural, =1 {{firstUser}} other {{users}}} to this channel once they are members of the {team} team.',
                },
                {
                    count: users.length,
                    users: (<FormattedList value={usersList}/>),
                    firstUser: (
                        <AtMention
                            key={firstName}
                            mentionName={firstName}
                        />
                    ),
                    team: (<strong>{team?.display_name}</strong>),
                },
            )
        );
    }, [users, getCommaSeparatedUsernames, team, formatMessage]);

    return (
        <>
            {
                (users.length > 0 || partners.length > 0) &&
                <AlertBanner
                    id='teamWarningBanner'
                    mode='warning'
                    variant='app'
                    title={
                        <FormattedMessage
                            id='channel_invite.invite_team_members.title'
                            defaultMessage='{count, plural, =1 {1 user was} other {# users were}} not selected because they are not a part of this team'
                            values={{
                                count: users.length + partners.length,
                            }}
                        />
                    }
                    message={
                        users.length > 0 &&
                        getMessage()
                    }
                    footerMessage={
                        partners.length > 0 &&
                        getPartnerMessage()
                    }
                />
            }
        </>
    );
};

export default React.memo(TeamWarningBanner);
