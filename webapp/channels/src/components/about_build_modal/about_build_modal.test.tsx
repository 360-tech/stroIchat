// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {ClientConfig, ClientLicense} from '@mattermost/types/config';

import AboutBuildModal from 'components/about_build_modal/about_build_modal';

import {renderWithContext, screen, userEvent} from 'tests/react_testing_utils';
import {AboutLinks} from 'utils/constants';

describe('components/AboutBuildModal', () => {
    const RealDate: DateConstructor = Date;

    let config: Partial<ClientConfig> = {};
    let license: ClientLicense = {};
    let socketStatus = {
        connected: false,
        serverHostname: '',
    };

    afterEach(() => {
        global.Date = RealDate;
        config = {};
        license = {};
        socketStatus = {
            connected: false,
            serverHostname: '',
        };
        jest.restoreAllMocks();
    });

    test('should match snapshot for enterprise edition', () => {
        renderAboutBuildModal({config, license, socketStatus});
        expect(screen.getByTestId('aboutModalVersionInfo')).toHaveTextContent('Server Version: 3.6.0');
        expect(screen.getByTestId('aboutModalVersionInfo')).toHaveTextContent('Database Schema Version: 77');
        expect(screen.getByTestId('aboutModalVersionInfo')).toHaveTextContent('Build Number: 123456');
        expect(screen.getByText('Mattermost Entry')).toBeInTheDocument();
        expect(screen.getByText('Modern communication from behind your firewall.')).toBeInTheDocument();
        expect(screen.getByRole('link', {name: 'mattermost.com'})).toHaveAttribute('href', 'https://mattermost.com/?utm_source=mattermost&utm_medium=in-product&utm_content=about_build_modal&uid=&sid=&edition=enterprise&server_version=3.6.0');
        expect(screen.getByText('EE Build Hash: 0123456789abcdef', {exact: false})).toBeInTheDocument();
        expect(screen.queryByText('Hostname: mock.localhost', {exact: false})).toBeInTheDocument();

        expect(screen.getByRole('link', {name: 'server'})).toHaveAttribute('href', 'https://github.com/mattermost/mattermost-server/blob/master/NOTICE.txt');
        expect(screen.getByRole('link', {name: 'desktop'})).toHaveAttribute('href', 'https://github.com/mattermost/desktop/blob/master/NOTICE.txt');
        expect(screen.getByRole('link', {name: 'mobile'})).toHaveAttribute('href', 'https://github.com/mattermost/mattermost-mobile/blob/master/NOTICE.txt');
    });

    test('should match snapshot for team edition', () => {
        const teamConfig = {
            ...config,
            BuildEnterpriseReady: 'false',
            BuildHashEnterprise: '',
        };

        renderAboutBuildModal({config: teamConfig, license: {}, socketStatus: {connected: false}});
        expect(screen.getByTestId('aboutModalVersionInfo')).toHaveTextContent('Server Version: 3.6.0');
        expect(screen.getByTestId('aboutModalVersionInfo')).toHaveTextContent('Database Schema Version: 77');
        expect(screen.getByTestId('aboutModalVersionInfo')).toHaveTextContent('Build Number: 123456');
        expect(screen.getByText('Mattermost Team Edition')).toBeInTheDocument();
        expect(screen.getByText('All your team communication in one place, instantly searchable and accessible anywhere.')).toBeInTheDocument();
        expect(screen.getByRole('link', {name: 'mattermost.com/community/'})).toHaveAttribute('href', 'https://mattermost.com/community/?utm_source=mattermost&utm_medium=in-product&utm_content=about_build_modal&uid=&sid=&edition=team&server_version=3.6.0');
        expect(screen.queryByText('EE Build Hash: 0123456789abcdef')).not.toBeInTheDocument();
        expect(screen.queryByText('Hostname: disconnected', {exact: false})).toBeInTheDocument();

        expect(screen.getByRole('link', {name: 'server'})).toHaveAttribute('href', 'https://github.com/mattermost/mattermost-server/blob/master/NOTICE.txt');
        expect(screen.getByRole('link', {name: 'desktop'})).toHaveAttribute('href', 'https://github.com/mattermost/desktop/blob/master/NOTICE.txt');
        expect(screen.getByRole('link', {name: 'mobile'})).toHaveAttribute('href', 'https://github.com/mattermost/mattermost-mobile/blob/master/NOTICE.txt');
    });

    test('should show n/a if this is a dev build', () => {
        const sameBuildConfig = {
            ...config,
            BuildEnterpriseReady: 'false',
            BuildHashEnterprise: '',
            Version: '3.6.0',
            SchemaVersion: '77',
            BuildNumber: 'dev',
        };

        renderAboutBuildModal({config: sameBuildConfig, license: {}, socketStatus: {connected: true}});

        expect(screen.getByTestId('aboutModalVersionInfo')).toHaveTextContent('Server Version: dev');
        expect(screen.getByTestId('aboutModalVersionInfo')).toHaveTextContent('Database Schema Version: 77');
        expect(screen.getByTestId('aboutModalVersionInfo')).toHaveTextContent('Build Number: n/a');
        expect(screen.getByText('Mattermost Team Edition')).toBeInTheDocument();
        expect(screen.getByText('All your team communication in one place, instantly searchable and accessible anywhere.')).toBeInTheDocument();
        expect(screen.getByRole('link', {name: 'mattermost.com/community/'})).toHaveAttribute('href', 'https://mattermost.com/community/?utm_source=mattermost&utm_medium=in-product&utm_content=about_build_modal&uid=&sid=&edition=team&server_version=dev');
        expect(screen.queryByText('EE Build Hash: 0123456789abcdef')).not.toBeInTheDocument();
        expect(screen.queryByText('Hostname: server did not provide hostname', {exact: false})).toBeInTheDocument();

        expect(screen.getByRole('link', {name: 'server'})).toHaveAttribute('href', 'https://github.com/mattermost/mattermost-server/blob/master/NOTICE.txt');
        expect(screen.getByRole('link', {name: 'desktop'})).toHaveAttribute('href', 'https://github.com/mattermost/desktop/blob/master/NOTICE.txt');
        expect(screen.getByRole('link', {name: 'mobile'})).toHaveAttribute('href', 'https://github.com/mattermost/mattermost-mobile/blob/master/NOTICE.txt');
    });

    test('should call onExited callback when the modal is hidden', async () => {
        const onExited = jest.fn();
        const state = {
            entities: {
                general: {
                    config: {},
                    license: {
                        Cloud: 'false',
                    },
                },
                users: {
                    currentUserId: 'currentUserId',
                },
            },
        };

        renderWithContext(
            <AboutBuildModal
                config={config}
                license={license}
                socketStatus={socketStatus}
                onExited={onExited}
            />,
            state,
        );

        await userEvent.click(screen.getByText('Close'));
        expect(onExited).toHaveBeenCalledTimes(1);
    });

    test('should show default tos and privacy policy links and not the config links', () => {
        const state = {
            entities: {
                general: {
                    config,
                    license: {
                        Cloud: 'false',
                    },
                },
                users: {
                    currentUserId: 'currentUserId',
                },
            },
        };
        renderWithContext(
            <AboutBuildModal
                config={config}
                license={license}
                socketStatus={socketStatus}
                onExited={jest.fn()}
            />,
            state,
        );

        expect(screen.getByRole('link', {name: 'Terms of Use'})).toHaveAttribute('href', `${AboutLinks.TERMS_OF_SERVICE}?utm_source=mattermost&utm_medium=in-product&utm_content=about_build_modal&uid=currentUserId&sid=&edition=enterprise&server_version=3.6.0`);

        expect(screen.getByRole('link', {name: 'Privacy Policy'})).toHaveAttribute('href', `${AboutLinks.PRIVACY_POLICY}?utm_source=mattermost&utm_medium=in-product&utm_content=about_build_modal&uid=currentUserId&sid=&edition=enterprise&server_version=3.6.0`);

        expect(screen.getByRole('link', {name: 'Terms of Use'})).not.toHaveAttribute('href', config?.TermsOfServiceLink);
        expect(screen.getByRole('link', {name: 'Privacy Policy'})).not.toHaveAttribute('href', config?.PrivacyPolicyLink);
    });

    function renderAboutBuildModal(props = {}) {
        const onExited = jest.fn();
        const show = true;

        const allProps = {
            show,
            onExited,
            config,
            license,
            socketStatus,
            ...props,
        };

        // Create state with the config and license for useExternalLink hook to access
        const state = {
            entities: {
                general: {
                    config: allProps.config,
                    license: allProps.license,
                },
                users: {
                    currentUserId: '',
                },
            },
        };

        return renderWithContext(<AboutBuildModal {...allProps}/>, state);
    }
});
