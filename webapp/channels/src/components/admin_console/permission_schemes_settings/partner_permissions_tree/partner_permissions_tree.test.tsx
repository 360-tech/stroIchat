// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import PartnerPermissionsTree from 'components/admin_console/permission_schemes_settings/partner_permissions_tree/partner_permissions_tree';
import PermissionGroup from 'components/admin_console/permission_schemes_settings/permission_group';

import {TestHelper} from 'utils/test_helper';

describe('components/admin_console/permission_schemes_settings/permission_tree', () => {
    const defaultProps = {
        scope: 'channel_scope',
        role: TestHelper.getRoleMock(
            {
                name: 'test',
                permissions: [],
            },
        ),
        onToggle: jest.fn(),
        selectRow: jest.fn(),
        parentRole: undefined,
        readOnly: false,
        license: {
            LDAPGroups: 'true',
            IsLicensed: 'true',
        },
    };

    test('should match snapshot on default data', () => {
        const wrapper = shallow(
            <PartnerPermissionsTree {...defaultProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot on read only', () => {
        const wrapper = shallow(
            <PartnerPermissionsTree
                {...defaultProps}
                readOnly={true}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot on team scope', () => {
        const wrapper = shallow(
            <PartnerPermissionsTree
                {...defaultProps}
                scope={'team_scope'}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot on system scope', () => {
        const wrapper = shallow(
            <PartnerPermissionsTree
                {...defaultProps}
                scope={'system_scope'}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with parentRole with permissions', () => {
        const defaultParentRole = TestHelper.getRoleMock({permissions: ['invite_user']});
        const wrapper = shallow(
            <PartnerPermissionsTree
                {...defaultProps}
                parentRole={defaultParentRole}
                scope={'system_scope'}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should ask to toggle on row toggle', () => {
        const onToggle = jest.fn();
        const wrapper = shallow(
            <PartnerPermissionsTree
                {...defaultProps}
                onToggle={onToggle}
            />,
        );
        wrapper.find(PermissionGroup).first().prop('onChange')(['test_permission', 'test_permission2']);
        expect(onToggle).toBeCalledWith('test', ['test_permission', 'test_permission2']);
    });

    test('should match snapshot on license without LDAPGroups', () => {
        const wrapper = shallow(
            <PartnerPermissionsTree
                {...defaultProps}
                license={{}}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
