// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import {getPrevTrialLicense} from 'mattermost-redux/actions/admin';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {openModal} from 'actions/views/modals';

import withGetCloudSubscription from 'components/common/hocs/cloud/with_get_cloud_subscription';

import type {GlobalState} from 'types/store';

import FeatureDiscovery from './feature_discovery';

const customer = undefined;
function mapStateToProps(state: GlobalState) {
    const subscription = state.entities.cloud.subscription;
    const config = getConfig(state);
    const isEnterpriseReady = config?.BuildEnterpriseReady === 'true';

    return {
        stats: state.entities.admin.analytics,
        prevTrialLicense: state.entities.admin.prevTrialLicense,
        isCloud: false,
        isSubscriptionLoaded: subscription !== undefined && subscription !== null,
        isEnterpriseReady,
        customer,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            getPrevTrialLicense,
            openModal,
        }, dispatch),
    };
}

export default withGetCloudSubscription(connect(mapStateToProps, mapDispatchToProps)(FeatureDiscovery));
