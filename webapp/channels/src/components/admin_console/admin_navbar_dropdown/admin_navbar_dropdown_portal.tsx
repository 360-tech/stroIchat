// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useLayoutEffect, useState} from 'react';

import RootPortal from 'components/root_portal';

type Props = {
    children: React.ReactNode;
};

type Position = {
    readonly top: number;
    readonly left: number;
    readonly width: number;
};

const AdminNavbarDropdownPortal = ({children}: Props) => {
    const [position, setPosition] = useState<Position | null>(null);

    useLayoutEffect(() => {
        const trigger = document.querySelector('.AdminSidebarHeader');
        if (!trigger) {
            return;
        }

        const rect = trigger.getBoundingClientRect();

        setPosition({
            top: rect.bottom,
            left: rect.left,
            width: rect.width,
        });
    }, []);

    if (!position) {
        return null;
    }

    return (
        <RootPortal>
            <div
                id='admin-navbar-dropdown-portal'
                style={{
                    position: 'absolute',
                    top: position.top,
                    left: position.left,
                    width: position.width,
                    zIndex: 10000,
                }}
            >
                {children}
            </div>
        </RootPortal>
    );
};

export default AdminNavbarDropdownPortal;

