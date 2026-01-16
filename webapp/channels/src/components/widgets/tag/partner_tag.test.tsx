// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {renderWithContext, screen} from 'tests/react_testing_utils';

import PartnerTag from './partner_tag';

describe('components/widgets/tag/PartnerTag', () => {
    test('should match the snapshot', () => {
        renderWithContext(<PartnerTag className={'test'}/>);
        screen.getByText('PARTNER');
    });

    test('should not render when hideTags is true', () => {
        renderWithContext(<PartnerTag className={'test'}/>, {entities: {general: {config: {HidePartnerTags: 'true'}}}});
        expect(() => screen.getByText('PARTNER')).toThrow();
    });
});
