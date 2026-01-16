// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import {PartnerSubtype} from 'utils/constants';

import './partner_subtype_selector.scss';

export type Props = {
    partnerSubtype: string;
    setPartnerSubtype: (subtype: string) => void;
    titleClass?: string;
}

export default function PartnerSubtypeSelector(props: Props) {
    const {formatMessage} = useIntl();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        props.setPartnerSubtype(e.target.value);
    };

    return (
        <div className='PartnerSubtypeSelector'>
            <div className={props.titleClass}>
                <FormattedMessage
                    id='invite_modal.partner_subtype.label'
                    defaultMessage='Partner Type'
                />
            </div>
            <select
                className='form-control PartnerSubtypeSelector__select'
                value={props.partnerSubtype}
                onChange={handleChange}
                data-testid='partnerSubtypeSelector'
            >
                <option value={PartnerSubtype.NOT_SPECIFIED}>
                    {formatMessage({
                        id: 'invite_modal.partner_subtype.not_specified',
                        defaultMessage: 'Not specified',
                    })}
                </option>
                <option value={PartnerSubtype.CONTRACTOR}>
                    {formatMessage({
                        id: 'invite_modal.partner_subtype.contractor',
                        defaultMessage: 'Contractor',
                    })}
                </option>
                <option value={PartnerSubtype.CUSTOMER}>
                    {formatMessage({
                        id: 'invite_modal.partner_subtype.customer',
                        defaultMessage: 'Customer',
                    })}
                </option>
                <option value={PartnerSubtype.PARTNER}>
                    {formatMessage({
                        id: 'invite_modal.partner_subtype.partner',
                        defaultMessage: 'Partner',
                    })}
                </option>
            </select>
        </div>
    );
}
