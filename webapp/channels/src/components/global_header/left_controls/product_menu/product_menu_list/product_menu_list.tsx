// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {useIntl} from 'react-intl';

import {
    ApplicationCogIcon,
    DownloadOutlineIcon,
    InformationOutlineIcon,
    ViewGridPlusOutlineIcon,
    WebhookIncomingIcon,
} from '@mattermost/compass-icons/components';
import type {UserProfile} from '@mattermost/types/users';

import {Permissions} from 'mattermost-redux/constants';

import AboutBuildModal from 'components/about_build_modal';
import {VisitSystemConsoleTour} from 'components/onboarding_tasks';
import SystemPermissionGate from 'components/permissions_gates/system_permission_gate';
// import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';
// import MarketplaceModal from 'components/plugin_marketplace/marketplace_modal';
import Menu from 'components/widgets/menu/menu';

import {ModalIdentifiers} from 'utils/constants';
// import {makeUrlSafe} from 'utils/url';
// import * as UserAgent from 'utils/user_agent';

import type {ModalData} from 'types/actions';

import './product_menu_list.scss';

export type Props = {
    isMobile: boolean;
    teamId?: string;
    teamName?: string;
    siteName: string;
    currentUser: UserProfile;
    isMessaging: boolean;
    enableCommands: boolean;
    enableIncomingWebhooks: boolean;
    enableOAuthServiceProvider: boolean;
    enableOutgoingWebhooks: boolean;
    canManageSystemBots: boolean;
    canManageIntegrations: boolean;
    enablePluginMarketplace: boolean;
    showVisitSystemConsoleTour: boolean;
    onClick?: React.MouseEventHandler<HTMLElement>;
    handleVisitConsoleClick: React.MouseEventHandler<HTMLElement>;
    actions: {
        openModal: <P>(modalData: ModalData<P>) => void;
        getPrevTrialLicense: () => void;
    };
};

const ProductMenuList = (props: Props): JSX.Element | null => {
    const {
        teamId,
        teamName,
        siteName,
        currentUser,
        isMessaging,
        enableCommands,
        enableIncomingWebhooks,
        enableOAuthServiceProvider,
        enableOutgoingWebhooks,
        canManageSystemBots,
        canManageIntegrations,
        enablePluginMarketplace,
        showVisitSystemConsoleTour,
        onClick,
        handleVisitConsoleClick,
        isMobile = false,
    } = props;
    const {formatMessage} = useIntl();

    useEffect(() => {
        props.actions.getPrevTrialLicense();
    }, []);

    if (!currentUser) {
        return null;
    }

    const someIntegrationEnabled = enableIncomingWebhooks || enableOutgoingWebhooks || enableCommands || enableOAuthServiceProvider || canManageSystemBots;
    const showIntegrations = !isMobile && someIntegrationEnabled && canManageIntegrations;

    return (
        <Menu.Group>
            <div onClick={onClick}>
                <SystemPermissionGate permissions={Permissions.SYSCONSOLE_READ_PERMISSIONS}>
                    <Menu.ItemLink
                        id='systemConsole'
                        show={!isMobile}
                        to='/admin_console'
                        text={(
                            <>
                                {formatMessage({id: 'navbar_dropdown.console', defaultMessage: 'System Console'})}
                                {showVisitSystemConsoleTour && (
                                    <div
                                        onClick={handleVisitConsoleClick}
                                        className={'system-console-visit'}
                                    >
                                        <VisitSystemConsoleTour/>
                                    </div>
                                )}
                            </>
                        )}
                        icon={<ApplicationCogIcon size={18}/>}
                    />
                </SystemPermissionGate>
                <Menu.ItemLink
                    id='integrations'
                    show={isMessaging && showIntegrations}
                    to={'/' + teamName + '/integrations'}
                    text={formatMessage({id: 'navbar_dropdown.integrations', defaultMessage: 'Integrations'})}
                    icon={<WebhookIncomingIcon size={18}/>}
                />
                {/* <TeamPermissionGate
                    teamId={teamId}
                    permissions={[Permissions.SYSCONSOLE_WRITE_PLUGINS]}
                >
                    <Menu.ItemToggleModalRedux
                        id='marketplaceModal'
                        modalId={ModalIdentifiers.PLUGIN_MARKETPLACE}
                        show={isMessaging && !isMobile && enablePluginMarketplace}
                        dialogType={MarketplaceModal}
                        text={formatMessage({id: 'navbar_dropdown.marketplace', defaultMessage: 'App Marketplace'})}
                        icon={<ViewGridPlusOutlineIcon size={18}/>}
                    />
                </TeamPermissionGate> */}
                <Menu.ItemToggleModalRedux
                    id='about'
                    modalId={ModalIdentifiers.ABOUT}
                    dialogType={AboutBuildModal}
                    text={formatMessage({id: 'navbar_dropdown.about', defaultMessage: 'About {appTitle}'}, {appTitle: siteName})}
                    icon={<InformationOutlineIcon size={18}/>}
                />
            </div>
        </Menu.Group>
    );
};

export default ProductMenuList;
