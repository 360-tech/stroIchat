// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import type {Channel} from '@mattermost/types/channels';
import type {UserProfile} from '@mattermost/types/users';

import ChannelInfoButton from './channel_info_button';
import CollapseLhsButton from './collapse_lhs_button';
import CollapseRhsButton from './collapse_rhs_button';
import ShowSearchButton from './show_search_button';
import UnmuteChannelButton from './unmute_channel_button';

import ChannelHeaderMenu from '../channel_header_menu/channel_header_menu';
import MobileChannelHeaderPlugins from '../channel_header_menu/menu_items/mobile_channel_header_plugins';

type Props = {
    channel?: Channel;

    inGlobalThreads?: boolean;
    inDrafts?: boolean;
    isMobileView: boolean;
    isLhsOpen: boolean;
    isDefaulTheme: boolean;
    isMuted?: boolean;
    isRHSOpen?: boolean;
    user: UserProfile;
    actions: {
        closeLhs: () => void;
        closeRhs: () => void;
        closeRhsMenu: () => void;
    };
}

export default class MobileChannelHeader extends React.PureComponent<Props> {
    innerWrapEl: HTMLElement | null = null;

    isLhsVisibleInDom = () => {
        const el = document.getElementById('SidebarContainer');
        if (!el) {
            return false;
        }

        return el.classList.contains('move--right') || el.classList.contains('dragging');
    };

    componentDidMount() {
        this.innerWrapEl = document.querySelector('.inner-wrap');
        this.innerWrapEl?.addEventListener('click', this.hideSidebars, true);

        if (this.props.isDefaulTheme) {
            const property = document.documentElement.style.getPropertyValue('--sidebar-bg');
            document.documentElement.style.setProperty('--sidebar-teambar-bg', property);
        }
    }

    componentWillUnmount() {
        this.innerWrapEl?.removeEventListener('click', this.hideSidebars, true);
    }

    hideSidebars = (e: MouseEvent) => {
        if (this.props.isMobileView) {
            if (this.props.isRHSOpen) {
                this.props.actions.closeRhs();
            }

            const target = e.target as HTMLElement | null | undefined;
            const clickedOnNavbarToggle = Boolean(target?.closest?.('.navbar-toggle'));
            const clickedOnIconBar = Boolean(target?.closest?.('.icon-bar'));

            if (!clickedOnNavbarToggle && !clickedOnIconBar) {
                const shouldConsumeEvent = this.props.isLhsOpen || this.isLhsVisibleInDom();

                if (shouldConsumeEvent) {
                    // Important: stop propagation/default BEFORE dispatch, чтобы клик
                    // по элементам под сайдбаром не считался их активацией.
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                }

                if (shouldConsumeEvent) {
                    this.props.actions.closeLhs();
                }
                this.props.actions.closeRhsMenu();

                // The event is already consumed above when LHS is actually open.
            }
        }
    };

    render() {
        const {user, channel, isMuted, inGlobalThreads, inDrafts} = this.props;

        let heading;
        if (inGlobalThreads) {
            heading = (
                <FormattedMessage
                    id='globalThreads.heading'
                    defaultMessage='Followed threads'
                />
            );
        } else if (inDrafts) {
            heading = (
                <FormattedMessage
                    id='drafts.heading'
                    defaultMessage='Drafts'
                />
            );
        } else if (channel) {
            heading = (
                <>
                    <ChannelHeaderMenu
                        isMobile={true}
                    />

                    {isMuted && (
                        <UnmuteChannelButton
                            user={user}
                            channel={channel}
                        />
                    )}
                </>
            );
        }

        return (
            <div className='row header'>
                <div id='navbar_wrapper'>
                    <nav
                        id='navbar'
                        className='navbar navbar-default navbar-fixed-top'
                        role='navigation'
                    >
                        <div className='container-fluid theme'>
                            <div className='navbar-header'>
                                <CollapseLhsButton/>
                                <div className={classNames('navbar-brand', {GlobalThreads___title: inGlobalThreads})}>
                                    {heading}
                                </div>
                                <div className='spacer'/>
                                {channel && (
                                    <ChannelInfoButton
                                        channel={channel}
                                    />
                                )}
                                {channel && (
                                    <MobileChannelHeaderPlugins
                                        channel={channel}
                                        isDropdown={false}
                                    />
                                )}
                                <ShowSearchButton/>
                                <CollapseRhsButton/>
                            </div>
                        </div>
                    </nav>
                </div>
            </div>
        );
    }
}
