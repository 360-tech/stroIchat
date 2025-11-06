// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useMemo} from 'react';
import {useSelector} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import type {GlobalState} from 'types/store';

export type ExternalLinkQueryParams = {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    userId?: string;
}

export function useExternalLink(href: string, location: string = '', overwriteQueryParams: ExternalLinkQueryParams = {}): [string, Record<string, string>] {
    const userId = useSelector(getCurrentUserId);
    const config = useSelector(getConfig);
    const telemetryId = useSelector((state: GlobalState) => getConfig(state)?.TelemetryId || '');

    return useMemo(() => {
        if (!href?.includes('mattermost.com') || href?.startsWith('mailto:')) {
            return [href, {}];
        }

        const parsedUrl = new URL(href);

        const edition = 'team';

        // Determine server version
        const serverVersion = config?.BuildNumber === 'dev' ? config.BuildNumber : (config?.Version || '');

        const existingURLSearchParams = parsedUrl.searchParams;
        const existingQueryParamsObj = Object.fromEntries(existingURLSearchParams.entries());
        const queryParams = {
            utm_source: 'stroichat',

            // utm_medium: utmMedium,
            utm_content: location,
            uid: userId,
            sid: telemetryId,
            edition,
            server_version: serverVersion,
            ...overwriteQueryParams,
            ...existingQueryParamsObj,
        };
        parsedUrl.search = Object.entries(queryParams).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&');

        return [parsedUrl.toString(), queryParams];
    }, [href, location, overwriteQueryParams, telemetryId, userId, config]);
}
