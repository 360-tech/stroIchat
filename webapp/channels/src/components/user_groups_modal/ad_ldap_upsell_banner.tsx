// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useState} from 'react';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';

import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {isAdmin} from 'mattermost-redux/utils/user_utils';

import {LicenseSkus} from 'utils/constants';

function ADLDAPUpsellBanner() {
    const [show, setShow] = useState(true);

    const {formatMessage} = useIntl();

    const isAdminUser = isAdmin(useSelector(getCurrentUser).roles);
    const currentLicense = useSelector(getLicense);

    const isSelfHostedProfessional = currentLicense?.SkuShortName === LicenseSkus.Professional;
    const isCloudProfessional = false;
    const isProfessional = isSelfHostedProfessional || isCloudProfessional;

    if (!show) {
        return null;
    }

    if (!isAdminUser) {
        return null;
    }

    if (!isProfessional) {
        return null;
    }

    return (
        <div
            id='ad_ldap_upsell_banner'
            className='ad_ldap_upsell_banner'
        >
            <div className='message'>
                <i className='icon icon-information-outline'/>
                {formatMessage({id: 'adldap_upsell_banner.banner_message', defaultMessage: 'AD/LDAP group sync creates groups faster'})}
            </div>
            <div className='btn-container'>
                <button
                    type='button'
                    aria-label='Close'
                    className='banner-close'
                    onClick={() => setShow(false)}
                >
                    <span aria-hidden='true'>{'×'}</span>
                    <span className='sr-only'>{'Close'}</span>
                </button>
            </div>
        </div>
    );
}

export default memo(ADLDAPUpsellBanner);
