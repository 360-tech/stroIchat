// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import type {ComponentType} from 'react';

import type {Subscription} from '@mattermost/types/cloud';

interface Actions {
    getCloudSubscription?: () => void;
}

interface UsedHocProps {
    subscription?: Subscription;
    isCloud: boolean;
    actions: Actions;
    userIsAdmin?: boolean;
}

function withGetCloudSubscription<P>(WrappedComponent: ComponentType<P>): ComponentType<any> {
    return class extends React.Component<P & UsedHocProps> {
        render(): JSX.Element {
            return <WrappedComponent {...this.props}/>;
        }
    };
}

export default withGetCloudSubscription;
