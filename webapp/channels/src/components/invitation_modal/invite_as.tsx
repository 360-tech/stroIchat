// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import RadioGroup from 'components/common/radio_group';

import './invite_as.scss';

export const InviteType = {
    MEMBER: 'MEMBER',
    PARTNER: 'PARTNER',
} as const;

export type InviteType = typeof InviteType[keyof typeof InviteType];

export type Props = {
    setInviteAs: (inviteType: InviteType) => void;
    inviteType: InviteType;
    titleClass?: string;
    canInvitePartners?: boolean;
}

export default function InviteAs(props: Props) {
    let partnerDisabled = null;

    // disable the radio button logic (is disabled when is starter - pre and post trial)
    if (!props.canInvitePartners) {
        partnerDisabled = (id: string) => {
            return (id === InviteType.PARTNER);
        };
    }

    return (
        <div className='InviteAs'>
            <div className={props.titleClass}>
                <FormattedMessage
                    id='invite_modal.as'
                    defaultMessage='Invite as'
                />
            </div>
            <div>
                <RadioGroup
                    onChange={(e) => props.setInviteAs(e.target.value as InviteType)}
                    value={props.inviteType}
                    id='invite-as'
                    values={[
                        {
                            key: (
                                <FormattedMessage
                                    id='invite_modal.choose_member'
                                    defaultMessage='Member'
                                />
                            ),
                            value: InviteType.MEMBER,
                            testId: 'inviteMembersLink',
                        },
                        {
                            key: (
                                <span className='InviteAs__label'>
                                    <FormattedMessage
                                        id='invite_modal.choose_partner_a'
                                        defaultMessage='Partner'
                                    />
                                    <span className='InviteAs__label--parenthetical'>
                                        {' - '}
                                        <FormattedMessage
                                            id='invite_modal.choose_partner_b'
                                            defaultMessage='limited to select channels and teams'
                                        />
                                    </span>
                                </span>
                            ),
                            value: InviteType.PARTNER,
                            testId: 'invitePartnerLink',
                        },
                    ]}
                    isDisabled={partnerDisabled}
                />
            </div>
        </div>
    );
}
