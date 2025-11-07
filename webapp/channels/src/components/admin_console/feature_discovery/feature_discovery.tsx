// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import type {MessageDescriptor} from 'react-intl';
import {FormattedMessage} from 'react-intl';

import type {AnalyticsState} from '@mattermost/types/admin';
import type {CloudCustomer} from '@mattermost/types/cloud';
import type {ClientLicense} from '@mattermost/types/config';

import type {LicenseSkus} from 'utils/constants';

import type {ModalData} from 'types/actions';

import './feature_discovery.scss';

type Props = {
    featureName: string;
    minimumSKURequiredForFeature: LicenseSkus;

    title: MessageDescriptor;
    copy: MessageDescriptor;

    learnMoreURL: string;

    featureDiscoveryImage: JSX.Element;

    prevTrialLicense: ClientLicense;

    stats?: AnalyticsState;
    actions: {
        getPrevTrialLicense: () => void;
        getCloudSubscription: () => void;
        openModal: <P>(modalData: ModalData<P>) => void;
    };
    isEnterpriseReady: boolean;
    isCloud: boolean;
    isCloudTrial: boolean;
    hadPrevCloudTrial: boolean;
    isSubscriptionLoaded: boolean;
    isPaidSubscription: boolean;
    customer?: CloudCustomer;
}

type State = {
    gettingTrial: boolean;
    gettingTrialError: string | null;
    gettingTrialResponseCode: number | null;
}

export default class FeatureDiscovery extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            gettingTrial: false,
            gettingTrialError: null,
            gettingTrialResponseCode: null,
        };
    }

    render() {
        const {
            title,
            copy,
            featureDiscoveryImage,
        } = this.props;

        return (
            <div
                className='FeatureDiscovery'
                data-testid='featureDiscovery'
            >
                <div className='FeatureDiscovery_copyWrapper'>
                    <div
                        className='FeatureDiscovery_title'
                        data-testid='featureDiscovery_title'
                    >
                        <FormattedMessage
                            {...title}
                        />
                    </div>
                    <div className='FeatureDiscovery_copy'>
                        <FormattedMessage
                            {...copy}
                        />
                    </div>
                </div>
                <div className='FeatureDiscovery_imageWrapper'>
                    {featureDiscoveryImage}
                </div>
            </div>
        );
    }
}
