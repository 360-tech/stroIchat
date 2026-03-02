// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage, useIntl} from 'react-intl';

import type {ClientConfig} from '@mattermost/types/config';

import Logo from 'components/common/svg_images_components/logo_dark_blue_svg';
import Nbsp from 'components/html_entities/nbsp';

type Props = {

    /**
     * Function called after the modal has been hidden
     */
    onExited: () => void;

    /**
     * Global config object
     */
    config: Partial<ClientConfig>;
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

    const siteName = config.SiteName || 'Стройчат';

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
                            appTitle: siteName,
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
                                {siteName}
                            </strong>
                        </h3>
                        <p className='about-modal__subtitle pb-2'>
                            {subTitle}
                        </p>
                        <div className='form-group less'>
                            <div>
                                <span>{intl.formatMessage(
                                    {id: 'about.reportBug', defaultMessage: 'Report Bug'},
                                )}{': '}</span>
                                <span>
                                    <a href='mailto:k@360tech.pro'>
                                        {'k@360tech.pro'}
                                    </a>
                                </span>
                            </div>
                            <div>
                                <span>{intl.formatMessage(
                                    {id: 'about.termsOfUse', defaultMessage: 'Terms of Use'},
                                )}{': '}</span>
                                <span>
                                    <a href='https://360tech.pro' target='_blank' rel='noopener noreferrer'>
                                        {'360tech.pro'}
                                    </a>
                                </span>
                            </div>
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
