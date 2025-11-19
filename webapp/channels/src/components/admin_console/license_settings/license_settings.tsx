// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, defineMessages} from 'react-intl';

import type {StatusOK} from '@mattermost/types/client4';
import type {ClientLicense, EnvironmentConfig} from '@mattermost/types/config';
import type {ServerError} from '@mattermost/types/errors';
import type {ServerLimits} from '@mattermost/types/limits';
import type {GetFilteredUsersStatsOpts, UsersStats} from '@mattermost/types/users';

import type {ActionResult} from 'mattermost-redux/types/actions';

import AdminHeader from 'components/widgets/admin_console/admin_header';

import type {ModalData} from 'types/actions';

import TeamEditionLeftPanel from './team_edition/team_edition_left_panel';
import UserSeatAlertBanner from './user_seat_alert_banner';

import './license_settings.scss';

type Props = {
    license: ClientLicense;
    enterpriseReady: boolean;
    upgradedFromTE: boolean;
    totalUsers: number;
    isDisabled: boolean;
    prevTrialLicense: ClientLicense;
    environmentConfig: Partial<EnvironmentConfig>;
    actions: {
        getLicenseConfig: () => void;
        uploadLicense: (file: File) => Promise<ActionResult>;
        removeLicense: () => Promise<ActionResult<boolean, ServerError>>;
        getPrevTrialLicense: () => void;
        upgradeToE0: () => Promise<StatusOK>;
        upgradeToE0Status: () => Promise<{percentage: number; error: string | JSX.Element | null}>;
        isAllowedToUpgradeToEnterprise: () => Promise<ActionResult>;
        restartServer: () => Promise<StatusOK>;
        ping: () => Promise<{status: string}>;
        requestTrialLicense: (users: number, termsAccepted: boolean, receiveEmailsAccepted: boolean, featureName: string) => Promise<ActionResult>;
        openModal: <P>(modalData: ModalData<P>) => void;
        getServerLimits: () => Promise<ActionResult<ServerLimits, ServerError>>;
        getFilteredUsersStats: (filters: GetFilteredUsersStatsOpts) => Promise<{
            data?: UsersStats;
            error?: ServerError;
        }>;
    };
}

const messages = defineMessages({
    title: {id: 'admin.license.title', defaultMessage: 'Edition and License'},
});

export const searchableStrings = [
    messages.title,
];

type State = Record<string, never>;
export default class LicenseSettings extends React.PureComponent<Props, State> {
    componentDidMount() {
        this.props.actions.getLicenseConfig();
        this.props.actions.getFilteredUsersStats({include_bots: false, include_deleted: false});
    }

    render() {
        const {license} = this.props;

        let leftPanel = null;

        if (!this.props.enterpriseReady) { // Team Edition
            // Note: DO NOT LOCALISE THESE STRINGS. Legally we can not since the license is in English.
            leftPanel = (
                <TeamEditionLeftPanel/>
            );
        }

        return (
            <div className='wrapper--fixed'>
                <AdminHeader>
                    <FormattedMessage {...messages.title}/>
                </AdminHeader>
                <div className='admin-console__wrapper'>
                    <div className='admin-console__content'>
                        <div className='admin-console__banner_section'>
                            <UserSeatAlertBanner
                                license={license}
                                totalUsers={this.props.totalUsers}
                                location='license_settings'
                            />
                        </div>
                        <div className='top-wrapper'>
                            <div className='left-panel'>
                                <div className='panel-card'>
                                    {leftPanel}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
