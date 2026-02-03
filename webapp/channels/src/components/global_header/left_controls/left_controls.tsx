// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

import ProductMenu from './product_menu';

const LeftControlsContainer = styled.div`
    display: flex;
    align-items: center;
    height: 40px;
    flex-shrink: 0;
    flex-basis: 30%;

    > * + * {
        margin-left: 12px;
    }
`;

const LeftControls = (): JSX.Element => (
    <LeftControlsContainer>
        <ProductMenu/>
    </LeftControlsContainer>
);

export default LeftControls;
