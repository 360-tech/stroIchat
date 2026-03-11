// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import './team_edition.scss';

const title = 'Стройхаб';

const TeamEdition: React.FC = () => {
    return (
        <div className='TeamEditionLeftPanel'>
            <div className='TeamEditionLeftPanel__Header'>
                <div className='TeamEditionLeftPanel__Title'>{title}</div>
            </div>
            <div className='TeamEditionLeftPanel__LicenseNotices'>
                <p>{'Open-source продукт на базе крупнейшего корпоративного мессенджера Mattermost, разрабатываемый компанией "360 Тех". Распространяется по лицензии MIT.'}</p>
                <p>{'team@360tech.pro'}</p>
            </div>
        </div>
    );
};

export default TeamEdition;
