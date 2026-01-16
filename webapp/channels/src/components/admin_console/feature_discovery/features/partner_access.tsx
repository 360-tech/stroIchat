// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {defineMessage} from 'react-intl';

import {LicenseSkus} from 'utils/constants';

import PartnerAccessSVG from './images/partner_access_svg';

import FeatureDiscovery from '../index';

const PartnerAccessFeatureDiscovery: React.FC = () => {
    return (
        <FeatureDiscovery
            featureName='partner_access'
            minimumSKURequiredForFeature={LicenseSkus.Starter}
            title={defineMessage({
                id: 'admin.partner_access_feature_discovery.title',
                defaultMessage: 'Enable partner accounts with Mattermost Professional',
            })}
            copy={defineMessage({
                id: 'admin.partner_access_feature_discovery.copy',
                defaultMessage: 'Collaborate with users outside of your organization while tightly controlling their access channels and team members.',
            })}
            learnMoreURL='https://docs.mattermost.com/deployment/partner-accounts.html'
            featureDiscoveryImage={<PartnerAccessSVG/>}
        />
    );
};

export default PartnerAccessFeatureDiscovery;
