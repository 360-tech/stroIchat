// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage, useIntl} from 'react-intl';

import type {ClientConfig, ClientLicense} from '@mattermost/types/config';

import Logo from 'components/common/svg_images_components/logo_dark_blue_svg';
import CopyButton from 'components/copy_button';
import Nbsp from 'components/html_entities/nbsp';

import {getDesktopVersion, isDesktopApp} from 'utils/user_agent';

type SocketStatus = {
    connected: boolean;
    serverHostname: string | undefined;
}

type Props = {

    /**
     * Function called after the modal has been hidden
     */
    onExited: () => void;

    /**
     * Global config object
     */
    config: Partial<ClientConfig>;

    /**
     * Global license object
     */
    license: ClientLicense;

    socketStatus: SocketStatus;
};

export default function AboutBuildModal(props: Props) {
    const intl = useIntl();
    const [show, setShow] = useState(true);

    const doHide = () => {
        setShow(false);
        props.onExited();
    };

    const config = props.config;

    const subTitle = (
        <FormattedMessage
            id='about.teamEditionSt'
            defaultMessage='All your team communication in one place, instantly searchable and accessible anywhere.'
        />
    );

    const getServerVersionString = () => {
        return intl.formatMessage(
            {id: 'about.serverVersion', defaultMessage: 'Server Version:'},
        ) + '\u00a0' + (config.BuildNumber === 'dev' ? config.BuildNumber : config.Version);
    };

    const getDesktopVersionString = () => {
        return intl.formatMessage(
            {id: 'about.desktopVersion', defaultMessage: 'Desktop Version:'},
        ) + '\u00a0' + getDesktopVersion();
    };

    const getDbVersionString = () => {
        return intl.formatMessage(
            {id: 'about.dbversion', defaultMessage: 'Database Schema Version:'},
        ) + '\u00a0' + config.SchemaVersion;
    };

    const getBuildNumberString = () => {
        return intl.formatMessage(
            {id: 'about.buildnumber', defaultMessage: 'Build Number:'},
        ) + '\u00a0' + (config.BuildNumber === 'dev' ? 'n/a' : config.BuildNumber);
    };

    const getDatabaseString = () => {
        return intl.formatMessage(
            {id: 'about.database', defaultMessage: 'Database:'},
        ) + '\u00a0' + config.SQLDriverName;
    };

    const versionInfo = () => {
        const parts = [
            getServerVersionString(),
            isDesktopApp() && getDesktopVersionString(),
            getDbVersionString(),
            getBuildNumberString(),
            getDatabaseString(),
        ].filter(Boolean);
        return parts.join('\n');
    };

    let serverHostname;
    if (!props.socketStatus.connected) {
        serverHostname = (
            <div>
                <FormattedMessage
                    id='about.serverHostname'
                    defaultMessage='Hostname:'
                />
                <Nbsp/>
                <FormattedMessage
                    id='about.serverDisconnected'
                    defaultMessage='disconnected'
                />
            </div>
        );
    } else if (props.socketStatus.serverHostname) {
        serverHostname = (
            <div>
                <FormattedMessage
                    id='about.serverHostname'
                    defaultMessage='Hostname:'
                />
                <Nbsp/>
                {props.socketStatus.serverHostname}
            </div>
        );
    } else {
        serverHostname = (
            <div>
                <FormattedMessage
                    id='about.serverHostname'
                    defaultMessage='Hostname:'
                />
                <Nbsp/>
                <FormattedMessage
                    id='about.serverUnknown'
                    defaultMessage='server did not provide hostname'
                />
            </div>
        );
    }

    return (
        <Modal
            dialogClassName='a11y__modal about-modal'
            show={show}
            onHide={doHide}
            onExited={props.onExited}
            role='dialog'
            aria-labelledby='aboutModalLabel'
        >
            <Modal.Header closeButton={true}>
                <Modal.Title
                    componentClass='h1'
                    id='aboutModalLabel'
                >
                    <FormattedMessage
                        id='about.title'
                        values={{
                            appTitle: config.SiteName || 'Stroichat',
                        }}
                        defaultMessage='About {appTitle}'
                    />
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='about-modal__content'>
                    <div className='about-modal__logo'>
                        <Logo/>
                    </div>
                    <div>
                        <h3 className='about-modal__title'>
                            <strong>
                                {'Stroichat'}
                            </strong>
                        </h3>
                        <p className='about-modal__subtitle pb-2'>
                            {subTitle}
                        </p>
                        <div className='form-group less'>
                            <div
                                className='about-modal__version-info'
                                data-testid='aboutModalVersionInfo'
                            >
                                {getServerVersionString()}<br/>
                                {isDesktopApp() && (
                                    <>
                                        {getDesktopVersionString()}<br/>
                                    </>
                                )}
                                {getDbVersionString()}<br/>
                                {getBuildNumberString()}<br/>
                                {getDatabaseString()}<br/>
                                <CopyButton
                                    className='about-modal__version-info-copy-button'
                                    isForText={true}
                                    content={versionInfo()}
                                />
                            </div>
                            {serverHostname}
                        </div>
                    </div>
                </div>
                <div className='about-modal__footer'>
                    <div className='form-group'>
                        <div className='about-modal__copyright'>
                            <FormattedMessage
                                id='about.copyright'
                                defaultMessage='Copyright 2015 - {currentYear} Stroichat, Inc. All rights reserved'
                                values={{
                                    currentYear: new Date().getFullYear(),
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div className='about-modal__hash'>
                    <p>
                        <FormattedMessage
                            id='about.hash'
                            defaultMessage='Build Hash:'
                        />
                        <Nbsp/>
                        {config.BuildHash}
                    </p>
                    <p>
                        <FormattedMessage
                            id='about.date'
                            defaultMessage='Build Date:'
                        />
                        <Nbsp/>
                        {config.BuildDate}
                    </p>
                </div>
            </Modal.Body>
        </Modal>
    );
}
