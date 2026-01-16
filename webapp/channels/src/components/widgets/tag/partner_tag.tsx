// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';

import type {GlobalState} from '@mattermost/types/store';

import {getConfig} from 'mattermost-redux/selectors/entities/general';

import Tag from './tag';
import type {TagSize} from './tag';

type Props = {
    className?: string;
    size?: TagSize;
};

const PartnerTag = ({className = '', size = 'xs'}: Props) => {
    const {formatMessage} = useIntl();
    const shouldHideTag = useSelector((state: GlobalState) => getConfig(state).HidePartnerTags === 'true');

    if (shouldHideTag) {
        return null;
    }

    return (
        <Tag
            className={classNames('PartnerTag', className)}
            size={size}
            text={formatMessage({
                id: 'tag.default.partner',
                defaultMessage: 'PARTNER',
            })}
        />
    );
};

export default PartnerTag;
