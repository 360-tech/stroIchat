// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import type {ChannelModeration as ChannelPermissions} from '@mattermost/types/channels';

import ChannelModeration, {ChannelModerationTableRow} from './channel_moderation';

describe('admin_console/team_channel_settings/channel/ChannelModeration', () => {
    const channelPermissions: ChannelPermissions[] = [{
        name: 'create_post',
        roles: {
            partners: {
                value: true,
                enabled: true,
            },
            members: {
                value: true,
                enabled: true,
            },
            admins: {
                value: true,
                enabled: true,
            },
        },
    }];
    const onChannelPermissionsChanged = () => {
        jest.fn();
    };
    const teamSchemeID = 'id';
    const teamSchemeDisplayName = 'dp';
    test('Should match first Snapshot', () => {
        const wrapper = shallow(
            <ChannelModeration
                channelPermissions={channelPermissions}
                onChannelPermissionsChanged={onChannelPermissionsChanged}
                teamSchemeID={teamSchemeID}
                teamSchemeDisplayName={teamSchemeDisplayName}
                partnerAccountsEnabled={true}
                readOnly={false}
                isPublic={true}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('Should match second Snapshot', () => {
        const wrapper = shallow(
            <ChannelModerationTableRow
                key={channelPermissions[0].name}
                name={channelPermissions[0].name}
                partners={channelPermissions[0].roles.partners?.value}
                partnersDisabled={!channelPermissions[0].roles.partners?.enabled}
                members={channelPermissions[0].roles.members.value}
                membersDisabled={!channelPermissions[0].roles.members.enabled}
                onClick={onChannelPermissionsChanged}
                errorMessages={jest.fn().mockResolvedValue([])}
                partnerAccountsEnabled={true}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('Should match third Snapshot', () => {
        const channelPermissionsCustom: ChannelPermissions[] = [
            {
                name: 'create_post',
                roles: {
                    partners: {
                        value: true,
                        enabled: true,
                    },
                    members: {
                        value: false,
                        enabled: true,
                    },
                    admins: {
                        value: true,
                        enabled: true,
                    },
                },
            },
            {
                name: 'use_channel_mentions',
                roles: {
                    partners: {
                        value: false,
                        enabled: false,
                    },
                    members: {
                        value: false,
                        enabled: false,
                    },
                    admins: {
                        value: true,
                        enabled: true,
                    },
                },
            },
        ];
        const wrapper = shallow(
            <ChannelModeration
                channelPermissions={channelPermissionsCustom}
                onChannelPermissionsChanged={onChannelPermissionsChanged}
                teamSchemeID={teamSchemeID}
                teamSchemeDisplayName={teamSchemeDisplayName}
                partnerAccountsEnabled={true}
                isPublic={true}
                readOnly={false}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('Should match fourth Snapshot', () => {
        const channelPermissionsCustom: ChannelPermissions[] = [
            {
                name: 'create_post',
                roles: {
                    partners: {
                        value: false,
                        enabled: true,
                    },
                    members: {
                        value: false,
                        enabled: true,
                    },
                    admins: {
                        value: true,
                        enabled: true,
                    },
                },
            },
            {
                name: 'use_channel_mentions',
                roles: {
                    partners: {
                        value: false,
                        enabled: false,
                    },
                    members: {
                        value: false,
                        enabled: false,
                    },
                    admins: {
                        value: true,
                        enabled: true,
                    },
                },
            },
        ];
        const wrapper = shallow(
            <ChannelModeration
                channelPermissions={channelPermissionsCustom}
                onChannelPermissionsChanged={onChannelPermissionsChanged}
                teamSchemeID={teamSchemeID}
                teamSchemeDisplayName={teamSchemeDisplayName}
                partnerAccountsEnabled={true}
                isPublic={false}
                readOnly={false}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('Should match fifth Snapshot', () => {
        const channelPermissionsCustom: ChannelPermissions[] = [
            {
                name: 'create_post',
                roles: {
                    partners: {
                        value: true,
                        enabled: true,
                    },
                    members: {
                        value: true,
                        enabled: true,
                    },
                    admins: {
                        value: true,
                        enabled: true,
                    },
                },
            },
            {
                name: 'use_channel_mentions',
                roles: {
                    partners: {
                        value: false,
                        enabled: false,
                    },
                    members: {
                        value: false,
                        enabled: false,
                    },
                    admins: {
                        value: true,
                        enabled: true,
                    },
                },
            },
        ];
        const wrapper = shallow(
            <ChannelModeration
                channelPermissions={channelPermissionsCustom}
                onChannelPermissionsChanged={onChannelPermissionsChanged}
                teamSchemeID={teamSchemeID}
                teamSchemeDisplayName={teamSchemeDisplayName}
                partnerAccountsEnabled={true}
                isPublic={true}
                readOnly={false}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('Should match sixth Snapshot', () => {
        const channelPermissionsCustom: ChannelPermissions[] = [
            {
                name: 'create_post',
                roles: {
                    partners: {
                        value: false,
                        enabled: true,
                    },
                    members: {
                        value: true,
                        enabled: true,
                    },
                    admins: {
                        value: true,
                        enabled: true,
                    },
                },
            },
            {
                name: 'use_channel_mentions',
                roles: {
                    partners: {
                        value: false,
                        enabled: false,
                    },
                    members: {
                        value: false,
                        enabled: false,
                    },
                    admins: {
                        value: true,
                        enabled: true,
                    },
                },
            },
        ];
        const wrapper = shallow(
            <ChannelModeration
                channelPermissions={channelPermissionsCustom}
                onChannelPermissionsChanged={onChannelPermissionsChanged}
                teamSchemeID={teamSchemeID}
                teamSchemeDisplayName={teamSchemeDisplayName}
                partnerAccountsEnabled={true}
                isPublic={false}
                readOnly={false}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('Should match sixth Snapshot', () => {
        const wrapper = shallow(
            <ChannelModeration
                channelPermissions={channelPermissions}
                onChannelPermissionsChanged={onChannelPermissionsChanged}
                teamSchemeID={undefined}
                teamSchemeDisplayName={undefined}
                partnerAccountsEnabled={false}
                isPublic={false}
                readOnly={false}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('Should match seventh Snapshot', () => {
        const wrapper = shallow(
            <ChannelModerationTableRow
                key={channelPermissions[0].name}
                name={channelPermissions[0].name}
                partners={channelPermissions[0].roles.partners?.value}
                partnersDisabled={!channelPermissions[0].roles.partners?.enabled}
                members={channelPermissions[0].roles.members.value}
                membersDisabled={!channelPermissions[0].roles.members.enabled}
                onClick={onChannelPermissionsChanged}
                errorMessages={jest.fn().mockResolvedValue([])}
                partnerAccountsEnabled={false}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    describe('errorMessages function', () => {
        test('Should not return any error messages', () => {
            const wrapper = shallow(
                <ChannelModeration
                    channelPermissions={channelPermissions}
                    onChannelPermissionsChanged={onChannelPermissionsChanged}
                    teamSchemeID={teamSchemeID}
                    teamSchemeDisplayName={teamSchemeDisplayName}
                    partnerAccountsEnabled={true}
                    isPublic={false}
                    readOnly={false}
                />,
            );
            const instance: any = wrapper.instance();
            const input: ChannelPermissions = channelPermissions[0];
            const output: any = [];
            const result = instance.errorMessagesToDisplay(input);
            expect(result.length).toEqual(0);
            expect(result).toEqual(output);
        });

        test('Should return error message when create_post partners disabled', () => {
            const wrapper = shallow(
                <ChannelModeration
                    channelPermissions={channelPermissions}
                    onChannelPermissionsChanged={onChannelPermissionsChanged}
                    teamSchemeID={teamSchemeID}
                    teamSchemeDisplayName={teamSchemeDisplayName}
                    partnerAccountsEnabled={true}
                    isPublic={false}
                    readOnly={false}
                />,
            );
            const instance: any = wrapper.instance();
            const input: ChannelPermissions = {
                name: 'create_post',
                roles: {
                    partners: {
                        value: true,
                        enabled: false,
                    },
                    members: {
                        value: true,
                        enabled: true,
                    },
                    admins: {
                        value: true,
                        enabled: true,
                    },
                },
            };
            const result = instance.errorMessagesToDisplay(input);
            expect(result.length).toEqual(1);
        });

        test('Should return error message when create_post members disabled', () => {
            const wrapper = shallow(
                <ChannelModeration
                    channelPermissions={channelPermissions}
                    onChannelPermissionsChanged={onChannelPermissionsChanged}
                    teamSchemeID={teamSchemeID}
                    teamSchemeDisplayName={teamSchemeDisplayName}
                    partnerAccountsEnabled={true}
                    isPublic={false}
                    readOnly={false}
                />,
            );
            const instance: any = wrapper.instance();
            const input: ChannelPermissions = {
                name: 'create_post',
                roles: {
                    partners: {
                        value: true,
                        enabled: true,
                    },
                    members: {
                        value: true,
                        enabled: false,
                    },
                    admins: {
                        value: true,
                        enabled: true,
                    },
                },
            };
            const result = instance.errorMessagesToDisplay(input);
            expect(result.length).toEqual(1);
        });

        test('Should return 1 error message when create_post members and partners disabled', () => {
            const wrapper = shallow(
                <ChannelModeration
                    channelPermissions={channelPermissions}
                    onChannelPermissionsChanged={onChannelPermissionsChanged}
                    teamSchemeID={teamSchemeID}
                    teamSchemeDisplayName={teamSchemeDisplayName}
                    partnerAccountsEnabled={true}
                    isPublic={false}
                    readOnly={false}
                />,
            );
            const instance: any = wrapper.instance();
            const input: ChannelPermissions = {
                name: 'create_post',
                roles: {
                    partners: {
                        value: true,
                        enabled: false,
                    },
                    members: {
                        value: true,
                        enabled: false,
                    },
                    admins: {
                        value: true,
                        enabled: true,
                    },
                },
            };
            const result = instance.errorMessagesToDisplay(input);
            expect(result.length).toEqual(1);
        });

        test('Should return not error messages for use_channel_mentions', () => {
            const channelPermissionsCustom: ChannelPermissions[] = [
                {
                    name: 'create_post',
                    roles: {
                        partners: {
                            value: true,
                            enabled: true,
                        },
                        members: {
                            value: true,
                            enabled: true,
                        },
                        admins: {
                            value: true,
                            enabled: true,
                        },
                    },
                },
                {
                    name: 'use_channel_mentions',
                    roles: {
                        partners: {
                            value: true,
                            enabled: true,
                        },
                        members: {
                            value: true,
                            enabled: true,
                        },
                        admins: {
                            value: true,
                            enabled: true,
                        },
                    },
                },
            ];
            const wrapper = shallow(
                <ChannelModeration
                    channelPermissions={channelPermissionsCustom}
                    onChannelPermissionsChanged={onChannelPermissionsChanged}
                    teamSchemeID={teamSchemeID}
                    teamSchemeDisplayName={teamSchemeDisplayName}
                    partnerAccountsEnabled={true}
                    isPublic={false}
                    readOnly={false}
                />,
            );
            const instance: any = wrapper.instance();
            const input: ChannelPermissions = channelPermissionsCustom[1];
            const result = instance.errorMessagesToDisplay(input);
            expect(result.length).toEqual(0);
        });

        test('Should return 2 error messages for use_channel_mentions', () => {
            const channelPermissionsCustom: ChannelPermissions[] = [
                {
                    name: 'create_post',
                    roles: {
                        partners: {
                            value: false,
                            enabled: true,
                        },
                        members: {
                            value: true,
                            enabled: true,
                        },
                        admins: {
                            value: true,
                            enabled: true,
                        },
                    },
                },
                {
                    name: 'use_channel_mentions',
                    roles: {
                        partners: {
                            value: false,
                            enabled: false,
                        },
                        members: {
                            value: true,
                            enabled: false,
                        },
                        admins: {
                            value: true,
                            enabled: true,
                        },
                    },
                },
            ];
            const wrapper = shallow(
                <ChannelModeration
                    channelPermissions={channelPermissionsCustom}
                    onChannelPermissionsChanged={onChannelPermissionsChanged}
                    teamSchemeID={teamSchemeID}
                    teamSchemeDisplayName={teamSchemeDisplayName}
                    partnerAccountsEnabled={true}
                    isPublic={false}
                    readOnly={false}
                />,
            );
            const instance: any = wrapper.instance();
            const input: ChannelPermissions = channelPermissionsCustom[1];
            const result = instance.errorMessagesToDisplay(input);
            expect(result.length).toEqual(2);
        });

        test('Should return 1 error messages for use_channel_mentions', () => {
            const channelPermissionsCustom: ChannelPermissions[] = [
                {
                    name: 'create_post',
                    roles: {
                        partners: {
                            value: false,
                            enabled: true,
                        },
                        members: {
                            value: false,
                            enabled: true,
                        },
                        admins: {
                            value: true,
                            enabled: true,
                        },
                    },
                },
                {
                    name: 'use_channel_mentions',
                    roles: {
                        partners: {
                            value: false,
                            enabled: false,
                        },
                        members: {
                            value: false,
                            enabled: false,
                        },
                        admins: {
                            value: true,
                            enabled: true,
                        },
                    },
                },
            ];
            const wrapper = shallow(
                <ChannelModeration
                    channelPermissions={channelPermissionsCustom}
                    onChannelPermissionsChanged={onChannelPermissionsChanged}
                    teamSchemeID={teamSchemeID}
                    teamSchemeDisplayName={teamSchemeDisplayName}
                    partnerAccountsEnabled={true}
                    isPublic={true}
                    readOnly={false}
                />,
            );
            const instance: any = wrapper.instance();
            const input: ChannelPermissions = channelPermissionsCustom[1];
            const result = instance.errorMessagesToDisplay(input);
            expect(result.length).toEqual(1);
        });

        test('Should return 2 error messages for use_channel_mentions', () => {
            const channelPermissionsCustom: ChannelPermissions[] = [
                {
                    name: 'create_post',
                    roles: {
                        partners: {
                            value: true,
                            enabled: true,
                        },
                        members: {
                            value: false,
                            enabled: true,
                        },
                        admins: {
                            value: true,
                            enabled: true,
                        },
                    },
                },
                {
                    name: 'use_channel_mentions',
                    roles: {
                        partners: {
                            value: false,
                            enabled: false,
                        },
                        members: {
                            value: false,
                            enabled: false,
                        },
                        admins: {
                            value: true,
                            enabled: true,
                        },
                    },
                },
            ];
            const wrapper = shallow(
                <ChannelModeration
                    channelPermissions={channelPermissionsCustom}
                    onChannelPermissionsChanged={onChannelPermissionsChanged}
                    teamSchemeID={teamSchemeID}
                    teamSchemeDisplayName={teamSchemeDisplayName}
                    partnerAccountsEnabled={true}
                    isPublic={true}
                    readOnly={false}
                />,
            );
            const instance: any = wrapper.instance();
            const input: ChannelPermissions = channelPermissionsCustom[1];
            const result = instance.errorMessagesToDisplay(input);
            expect(result.length).toEqual(2);
        });

        test('Should return 1 error messages for use_channel_mention when create_posts is checked and use_channel_mentions is disabled', () => {
            const channelPermissionsCustom: ChannelPermissions[] = [
                {
                    name: 'create_post',
                    roles: {
                        partners: {
                            value: true,
                            enabled: true,
                        },
                        members: {
                            value: true,
                            enabled: true,
                        },
                        admins: {
                            value: true,
                            enabled: true,
                        },
                    },
                },
                {
                    name: 'use_channel_mentions',
                    roles: {
                        partners: {
                            value: false,
                            enabled: false,
                        },
                        members: {
                            value: false,
                            enabled: false,
                        },
                        admins: {
                            value: true,
                            enabled: true,
                        },
                    },
                },
            ];
            const wrapper = shallow(
                <ChannelModeration
                    channelPermissions={channelPermissionsCustom}
                    onChannelPermissionsChanged={onChannelPermissionsChanged}
                    teamSchemeID={teamSchemeID}
                    teamSchemeDisplayName={teamSchemeDisplayName}
                    partnerAccountsEnabled={true}
                    isPublic={true}
                    readOnly={false}
                />,
            );
            const instance: any = wrapper.instance();
            const input: ChannelPermissions = channelPermissionsCustom[1];
            const result = instance.errorMessagesToDisplay(input);
            expect(result.length).toEqual(1);
        });
    });
});
