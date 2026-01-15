// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import {GuestSubtype} from 'utils/constants';

import './guest_subtype_selector.scss';

export type Props = {
    guestSubtype: string;
    setGuestSubtype: (subtype: string) => void;
    titleClass?: string;
}

export default function GuestSubtypeSelector(props: Props) {
    const {formatMessage} = useIntl();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        props.setGuestSubtype(e.target.value);
    };

    return (
        <div className='GuestSubtypeSelector'>
            <div className={props.titleClass}>
                <FormattedMessage
                    id='invite_modal.guest_subtype.label'
                    defaultMessage='Guest Type'
                />
            </div>
            <select
                className='form-control GuestSubtypeSelector__select'
                value={props.guestSubtype}
                onChange={handleChange}
                data-testid='guestSubtypeSelector'
            >
                <option value={GuestSubtype.NOT_SPECIFIED}>
                    {formatMessage({
                        id: 'invite_modal.guest_subtype.not_specified',
                        defaultMessage: 'Not specified',
                    })}
                </option>
                <option value={GuestSubtype.CONTRACTOR}>
                    {formatMessage({
                        id: 'invite_modal.guest_subtype.contractor',
                        defaultMessage: 'Contractor',
                    })}
                </option>
                <option value={GuestSubtype.CUSTOMER}>
                    {formatMessage({
                        id: 'invite_modal.guest_subtype.customer',
                        defaultMessage: 'Customer',
                    })}
                </option>
                <option value={GuestSubtype.PARTNER}>
                    {formatMessage({
                        id: 'invite_modal.guest_subtype.partner',
                        defaultMessage: 'Partner',
                    })}
                </option>
            </select>
        </div>
    );
}
