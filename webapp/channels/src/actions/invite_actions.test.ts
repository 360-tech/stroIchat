// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Channel} from '@mattermost/types/channels';
import type {UserProfile} from '@mattermost/types/users';

import {sendMembersInvites, sendPartnersInvites} from 'actions/invite_actions';

import mockStore from 'tests/test_store';
import {ConsolePages} from 'utils/constants';
import {TestHelper} from 'utils/test_helper';

jest.mock('actions/team_actions', () => ({
    addUsersToTeam: () => ({ // since we are using addUsersToTeamGracefully, this call will always succeed
        type: 'MOCK_RECEIVED_ME',
    }),
}));

jest.mock('mattermost-redux/actions/channels', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    joinChannel: (_userId: string, _teamId: string, channelId: string, _channelName: string) => {
        if (channelId === 'correct') {
            return ({type: 'MOCK_RECEIVED_ME'});
        }
        if (channelId === 'correct2') {
            return ({type: 'MOCK_RECEIVED_ME'});
        }
        throw new Error('ERROR');
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getChannelMembersByIds: (channelId: string, userIds: string[]) => {
        return ({type: 'MOCK_RECEIVED_CHANNEL_MEMBERS'});
    },
}));

jest.mock('mattermost-redux/actions/teams', () => ({
    getTeamMembersByIds: () => ({type: 'MOCK_RECEIVED_ME'}),
    sendEmailInvitesToTeamGracefully: (team: string, emails: string[]) => {
        if (team === 'incorrect-default-smtp') {
            return ({type: 'MOCK_RECEIVED_ME', data: emails.map((email) => ({email, error: {message: '(From server) SMTP is not configured in System Console.', id: 'api.team.invite_members.unable_to_send_email_with_defaults.app_error'}}))});
        } else if (emails.length > 21) { // Poor attempt to mock rate limiting.
            return ({type: 'MOCK_RECEIVED_ME', data: emails.map((email) => ({email, error: {message: '(From server) Invite emails rate limit exceeded.'}}))});
        } else if (team === 'error') {
            return ({type: 'MOCK_RECEIVED_ME', data: emails.map((email) => ({email, error: {message: '(From server) Unable to add the user to the team.'}}))});
        }

        // team === 'correct' i.e no error
        return ({type: 'MOCK_RECEIVED_ME', data: emails.map((email) => ({email, error: undefined}))});
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sendEmailPartnerInvitesToChannelsGracefully: (teamId: string, _channelIds: string[], emails: string[], _message: string) => {
        if (teamId === 'incorrect-default-smtp') {
            return ({type: 'MOCK_RECEIVED_ME', data: emails.map((email) => ({email, error: {message: '(From server) SMTP is not configured in System Console.', id: 'api.team.invite_members.unable_to_send_email_with_defaults.app_error'}}))});
        } else if (emails.length > 21) { // Poor attempt to mock rate limiting.
            return ({type: 'MOCK_RECEIVED_ME', data: emails.map((email) => ({email, error: {message: '(From server) Invite emails rate limit exceeded.'}}))});
        } else if (teamId === 'error') {
            return ({type: 'MOCK_RECEIVED_ME', data: emails.map((email) => ({email, error: {message: '(From server) Unable to add the partner to the channels.'}}))});
        }

        // teamId === 'correct' i.e no error
        return ({type: 'MOCK_RECEIVED_ME', data: emails.map((email) => ({email, error: undefined}))});
    },
}));

describe('actions/invite_actions', () => {
    const store = mockStore({
        entities: {
            general: {
                config: {
                    DefaultClientLocale: 'en',
                },
            },
            teams: {
                teams: {
                    correct: {id: 'correct'},
                    error: {id: 'error'},
                },
                membersInTeam: {
                    correct: {
                        user1: TestHelper.getTeamMembershipMock({user_id: 'user1', team_id: 'correct'}),
                        user2: TestHelper.getTeamMembershipMock({user_id: 'user2', team_id: 'correct'}),
                        partner1: TestHelper.getTeamMembershipMock({user_id: 'partner1', team_id: 'correct'}),
                        partner2: TestHelper.getTeamMembershipMock({user_id: 'partner2', team_id: 'correct'}),
                        partner3: TestHelper.getTeamMembershipMock({user_id: 'partner3', team_id: 'correct'}),
                    },
                    error: {
                        user1: TestHelper.getTeamMembershipMock({user_id: 'user1', team_id: 'error'}),
                        user2: TestHelper.getTeamMembershipMock({user_id: 'user2', team_id: 'error'}),
                        partner1: TestHelper.getTeamMembershipMock({user_id: 'partner1', team_id: 'error'}),
                        partner2: TestHelper.getTeamMembershipMock({user_id: 'partner2', team_id: 'error'}),
                        partner3: TestHelper.getTeamMembershipMock({user_id: 'partner3', team_id: 'error'}),
                    },
                },
                myMembers: {},
            },
            channels: {
                myMembers: {},
                channels: {},
                membersInChannel: {
                    correct: {
                        partner2: TestHelper.getChannelMembershipMock({user_id: 'partner2', channel_id: 'correct'}),
                        partner3: TestHelper.getChannelMembershipMock({user_id: 'partner3', channel_id: 'correct'}),
                    },
                    correct2: {
                        partner2: TestHelper.getChannelMembershipMock({user_id: 'partner2', channel_id: 'correct2'}),
                    },
                    error: {
                        partner2: TestHelper.getChannelMembershipMock({user_id: 'partner2', channel_id: 'error'}),
                        partner3: TestHelper.getChannelMembershipMock({user_id: 'partner3', channel_id: 'error'}),
                    },
                },
            },
            users: {
                currentUserId: 'user1',
                profiles: {
                    user1: {
                        roles: 'system_admin',
                    },
                },
            },
        },
    });

    describe('sendMembersInvites', () => {
        it('should generate and empty list if nothing is passed', async () => {
            const response = await store.dispatch(sendMembersInvites('correct', [], []));
            expect(response).toEqual({
                data: {
                    sent: [],
                    notSent: [],
                },
            });
        });

        it('should generate list of success for emails', async () => {
            const emails = ['email-one@email-one.com', 'email-two@email-two.com', 'email-three@email-three.com'];
            const response = await store.dispatch(sendMembersInvites('correct', [], emails));
            expect(response).toEqual({
                data: {
                    notSent: [],
                    sent: [
                        {
                            email: 'email-one@email-one.com',
                            reason: {
                                id: 'invite.members.invite-sent',
                                defaultMessage: 'An invitation email has been sent.',
                            },
                        },
                        {
                            email: 'email-two@email-two.com',
                            reason: {
                                id: 'invite.members.invite-sent',
                                defaultMessage: 'An invitation email has been sent.',
                            },
                        },
                        {
                            email: 'email-three@email-three.com',
                            reason: {
                                id: 'invite.members.invite-sent',
                                defaultMessage: 'An invitation email has been sent.',
                            },
                        },
                    ],
                },
            });
        });

        it('should generate list of failures for emails on invite fails', async () => {
            const emails = ['email-one@email-one.com', 'email-two@email-two.com', 'email-three@email-three.com'];
            const response = await store.dispatch(sendMembersInvites('error', [], emails));
            expect(response).toEqual({
                data: {
                    sent: [],
                    notSent: [
                        {
                            email: 'email-one@email-one.com',
                            reason: '(From server) Unable to add the user to the team.',
                        },
                        {
                            email: 'email-two@email-two.com',
                            reason: '(From server) Unable to add the user to the team.',
                        },
                        {
                            email: 'email-three@email-three.com',
                            reason: '(From server) Unable to add the user to the team.',
                        },
                    ],
                },
            });
        });

        it('should generate list of failures and success for regular users and partners', async () => {
            const users = [
                {id: 'user1', roles: 'system_user'},
                {id: 'partner1', roles: 'system_partner'},
                {id: 'other-user', roles: 'system_user'},
                {id: 'other-partner', roles: 'system_partner'},
            ] as UserProfile[];
            const response = await store.dispatch(sendMembersInvites('correct', users, []));
            expect(response).toEqual({
                data: {
                    sent: [
                        {
                            reason: {
                                id: 'invite.members.added-to-team',
                                defaultMessage: 'This member has been added to the team.',
                            },
                            user: {
                                id: 'other-user',
                                roles: 'system_user',
                            },
                        },
                    ],
                    notSent: [
                        {
                            reason: {
                                id: 'invite.members.already-member',
                                defaultMessage: 'This person is already a team member.',
                            },
                            user: {
                                id: 'user1',
                                roles: 'system_user',
                            },
                        },
                        {
                            reason: {
                                id: 'invite.members.user-is-partner',
                                defaultMessage: 'Contact your admin to make this partner a full member.',
                            },
                            user: {
                                id: 'partner1',
                                roles: 'system_partner',
                            },
                        },
                        {
                            reason: {
                                id: 'invite.members.user-is-partner',
                                defaultMessage: 'Contact your admin to make this partner a full member.',
                            },
                            user: {
                                id: 'other-partner',
                                roles: 'system_partner',
                            },
                        },
                    ],
                },
            });
        });

        it('should generate a failure for problems adding a user', async () => {
            const users = [
                {id: 'user1', roles: 'system_user'},
                {id: 'partner1', roles: 'system_partner'},
                {id: 'other-user', roles: 'system_user'},
                {id: 'other-partner', roles: 'system_partner'},
            ] as UserProfile[];
            const response = await store.dispatch(sendMembersInvites('error', users, []));
            expect(response).toEqual({
                data: {
                    sent: [
                        {
                            reason: {
                                id: 'invite.members.added-to-team',
                                defaultMessage: 'This member has been added to the team.',
                            },
                            user: {
                                id: 'other-user',
                                roles: 'system_user',
                            },
                        },
                    ],
                    notSent: [
                        {
                            reason: {
                                id: 'invite.members.already-member',
                                defaultMessage: 'This person is already a team member.',
                            },
                            user: {
                                id: 'user1',
                                roles: 'system_user',
                            },
                        },
                        {
                            reason: {
                                id: 'invite.members.user-is-partner',
                                defaultMessage: 'Contact your admin to make this partner a full member.',
                            },
                            user: {
                                id: 'partner1',
                                roles: 'system_partner',
                            },
                        },
                        {
                            reason: {
                                id: 'invite.members.user-is-partner',
                                defaultMessage: 'Contact your admin to make this partner a full member.',
                            },
                            user: {
                                id: 'other-partner',
                                roles: 'system_partner',
                            },
                        },
                    ],
                },
            });
        });

        it('should generate a failure for rate limits', async () => {
            const emails = [];
            const expectedNotSent = [];
            for (let i = 0; i < 22; i++) {
                emails.push('email-' + i + '@example.com');
                expectedNotSent.push({
                    email: 'email-' + i + '@example.com',
                    reason: '(From server) Invite emails rate limit exceeded.',
                });
            }
            const response = await store.dispatch(sendMembersInvites('correct', [], emails));
            expect(response).toEqual({
                data: {
                    notSent: expectedNotSent,
                    sent: [],
                },
            });
        });

        it('should generate a failure for smtp config', async () => {
            const emails = ['email-one@email-one.com'];
            const response = await store.dispatch(sendMembersInvites('incorrect-default-smtp', [], emails));
            expect(response).toEqual({
                data: {
                    notSent: [
                        {
                            email: 'email-one@email-one.com',
                            reason: {
                                id: 'admin.environment.smtp.smtpFailure',
                                defaultMessage: 'SMTP is not configured in System Console. Can be configured <a>here</a>.',
                            },
                            path: ConsolePages.SMTP,
                        }],
                    sent: [],
                },
            });
        });
    });

    describe('sendPartnersInvites', () => {
        it('should generate and empty list if nothing is passed', async () => {
            const response = await store.dispatch(sendPartnersInvites('correct', [], [], [], ''));
            expect(response).toEqual({
                data: {
                    sent: [],
                    notSent: [],
                },
            });
        });

        it('should generate list of success for emails', async () => {
            const channels = [{id: 'correct'}] as Channel[];
            const emails = ['email-one@email-one.com', 'email-two@email-two.com', 'email-three@email-three.com'];
            const response = await store.dispatch(sendPartnersInvites('correct', channels, [], emails, 'message'));
            expect(response).toEqual({
                data: {
                    notSent: [],
                    sent: [
                        {
                            email: 'email-one@email-one.com',
                            reason: {
                                id: 'invite.partners.added-to-channel',
                                defaultMessage: 'An invitation email has been sent.',
                            },
                        },
                        {
                            email: 'email-two@email-two.com',
                            reason: {
                                id: 'invite.partners.added-to-channel',
                                defaultMessage: 'An invitation email has been sent.',
                            },
                        },
                        {
                            email: 'email-three@email-three.com',
                            reason: {
                                id: 'invite.partners.added-to-channel',
                                defaultMessage: 'An invitation email has been sent.',
                            },
                        },
                    ],
                },
            });
        });

        it('should generate list of failures for emails on invite fails', async () => {
            const channels = [{id: 'correct'}] as Channel[];
            const emails = ['email-one@email-one.com', 'email-two@email-two.com', 'email-three@email-three.com'];
            const response = await store.dispatch(sendPartnersInvites('error', channels, [], emails, 'message'));
            expect(response).toEqual({
                data: {
                    sent: [],
                    notSent: [
                        {
                            email: 'email-one@email-one.com',
                            reason: '(From server) Unable to add the partner to the channels.',
                        },
                        {
                            email: 'email-two@email-two.com',
                            reason: '(From server) Unable to add the partner to the channels.',
                        },
                        {
                            email: 'email-three@email-three.com',
                            reason: '(From server) Unable to add the partner to the channels.',
                        },
                    ],
                },
            });
        });

        it('should generate list of failures and success for regular users and partners', async () => {
            const channels = [{id: 'correct'}] as Channel[];
            const users = [
                {id: 'user1', roles: 'system_user'},
                {id: 'partner1', roles: 'system_partner'},
                {id: 'other-user', roles: 'system_user'},
                {id: 'other-partner', roles: 'system_partner'},
            ] as UserProfile[];
            const response = await store.dispatch(sendPartnersInvites('correct', channels, users, [], 'message'));
            expect(response).toEqual({
                data: {
                    sent: [
                        {
                            reason: {
                                id: 'invite.partners.new-member',
                                defaultMessage: 'This partner has been added to the team and {count, plural, one {channel} other {channels}}.',
                                values: {count: channels.length},
                            },
                            user: {
                                id: 'partner1',
                                roles: 'system_partner',
                            },
                        },
                        {
                            reason: {
                                id: 'invite.partners.new-member',
                                defaultMessage: 'This partner has been added to the team and {count, plural, one {channel} other {channels}}.',
                                values: {count: channels.length},
                            },
                            user: {
                                id: 'other-partner',
                                roles: 'system_partner',
                            },
                        },
                    ],
                    notSent: [
                        {
                            reason: {
                                id: 'invite.members.user-is-not-partner',
                                defaultMessage: 'This person is already a member of the workspace. Invite them as a member instead of a partner.',
                            },
                            user: {
                                id: 'user1',
                                roles: 'system_user',
                            },
                        },
                        {
                            reason: {
                                id: 'invite.members.user-is-not-partner',
                                defaultMessage: 'This person is already a member of the workspace. Invite them as a member instead of a partner.',
                            },
                            user: {
                                id: 'other-user',
                                roles: 'system_user',
                            },
                        },
                    ],
                },
            });
        });

        it('should generate a failure for users that are part of all or some of the channels', async () => {
            const users = [
                {id: 'partner2', roles: 'system_partner'},
                {id: 'partner3', roles: 'system_partner'},
            ] as UserProfile[];
            const response = await store.dispatch(sendPartnersInvites('correct', [{id: 'correct'}, {id: 'correct2'}] as Channel[], users, [], 'message'));
            expect(response).toEqual({
                data: {
                    sent: [],
                    notSent: [
                        {
                            reason: {
                                id: 'invite.partners.already-all-channels-member',
                                defaultMessage: 'This person is already a member of all the channels.',
                            },
                            user: {
                                id: 'partner2',
                                roles: 'system_partner',
                            },
                        },
                        {
                            reason: {
                                id: 'invite.partners.already-some-channels-member',
                                defaultMessage: 'This person is already a member of some of the channels.',
                            },
                            user: {
                                id: 'partner3',
                                roles: 'system_partner',
                            },
                        },
                    ],
                },
            });
        });

        it('should generate a failure for problems adding a user to team', async () => {
            const users = [
                {id: 'user1', roles: 'system_user'},
                {id: 'partner1', roles: 'system_partner'},
                {id: 'other-user', roles: 'system_user'},
                {id: 'other-partner', roles: 'system_partner'},
            ] as UserProfile[];
            const response = await store.dispatch(sendPartnersInvites('error', [{id: 'correct'}] as Channel[], users, [], 'message'));

            expect(response).toEqual({
                data: {
                    sent: [
                        {
                            user: {
                                id: 'partner1',
                                roles: 'system_partner',
                            },
                            reason: {
                                id: 'invite.partners.new-member',
                                defaultMessage: 'This partner has been added to the team and {count, plural, one {channel} other {channels}}.',
                                values: {
                                    count: 1,
                                },
                            },
                        },
                        {
                            user: {
                                id: 'other-partner',
                                roles: 'system_partner',
                            },
                            reason: {
                                id: 'invite.partners.new-member',
                                defaultMessage: 'This partner has been added to the team and {count, plural, one {channel} other {channels}}.',
                                values: {
                                    count: 1,
                                },
                            },
                        },
                    ],
                    notSent: [
                        {
                            reason: {
                                id: 'invite.members.user-is-not-partner',
                                defaultMessage: 'This person is already a member of the workspace. Invite them as a member instead of a partner.',
                            },
                            user: {
                                id: 'user1',
                                roles: 'system_user',
                            },
                        },
                        {
                            reason: {
                                id: 'invite.members.user-is-not-partner',
                                defaultMessage: 'This person is already a member of the workspace. Invite them as a member instead of a partner.',
                            },
                            user: {
                                id: 'other-user',
                                roles: 'system_user',
                            },
                        },
                    ],
                },
            });
        });

        it('should generate a failure for problems adding a user to channels', async () => {
            const users = [
                {id: 'user1', roles: 'system_user'},
                {id: 'partner1', roles: 'system_partner'},
                {id: 'other-user', roles: 'system_user'},
                {id: 'other-partner', roles: 'system_partner'},
            ] as UserProfile[];
            const response = await store.dispatch(sendPartnersInvites('correct', [{id: 'error'}] as Channel[], users, [], 'message'));
            expect(response).toEqual({
                data: {
                    sent: [],
                    notSent: [
                        {
                            reason: {
                                id: 'invite.members.user-is-not-partner',
                                defaultMessage: 'This person is already a member of the workspace. Invite them as a member instead of a partner.',
                            },
                            user: {
                                id: 'user1',
                                roles: 'system_user',
                            },
                        },
                        {
                            reason: {
                                id: 'invite.partners.unable-to-add-the-user-to-the-channels',
                                defaultMessage: 'Unable to add the partner to the channels.',
                            },
                            user: {
                                id: 'partner1',
                                roles: 'system_partner',
                            },
                        },
                        {
                            reason: {
                                id: 'invite.members.user-is-not-partner',
                                defaultMessage: 'This person is already a member of the workspace. Invite them as a member instead of a partner.',
                            },
                            user: {
                                id: 'other-user',
                                roles: 'system_user',
                            },
                        },
                        {
                            reason: {
                                id: 'invite.partners.unable-to-add-the-user-to-the-channels',
                                defaultMessage: 'Unable to add the partner to the channels.',
                            },
                            user: {
                                id: 'other-partner',
                                roles: 'system_partner',
                            },
                        },
                    ],
                },
            });
        });

        it('should generate a failure for rate limits', async () => {
            const emails = [];
            const expectedNotSent = [];
            for (let i = 0; i < 22; i++) {
                emails.push('email-' + i + '@example.com');
                expectedNotSent.push({
                    email: 'email-' + i + '@example.com',
                    reason: '(From server) Invite emails rate limit exceeded.',
                });
            }

            const response = await store.dispatch(sendPartnersInvites('correct', [{id: 'correct'}] as Channel[], [], emails, 'message'));
            expect(response).toEqual({
                data: {
                    notSent: expectedNotSent,
                    sent: [],
                },
            });
        });

        it('should generate a failure for smtp config', async () => {
            const emails = ['email-one@email-one.com'];
            const response = await store.dispatch(sendPartnersInvites('incorrect-default-smtp', [{id: 'error'}] as Channel[], [], emails, 'message'));
            expect(response).toEqual({
                data: {
                    notSent: [
                        {
                            email: 'email-one@email-one.com',
                            reason: {
                                id: 'admin.environment.smtp.smtpFailure',
                                defaultMessage: 'SMTP is not configured in System Console. Can be configured <a>here</a>.',
                            },
                            path: ConsolePages.SMTP,
                        }],
                    sent: [],
                },
            });
        });
    });
});
