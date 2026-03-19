/* eslint-disable header/header */
import {Client4} from 'mattermost-redux/client';

import {getSiteURL} from 'utils/url';

const PLUGIN_ID = 'com.company.category-share';

type RequestOptions = {
    method: 'GET' | 'POST';
    body?: Record<string, unknown>;
};

const normalizeShareUrl = (url: string): string => {
    if ((/^https?:\/\//).test(url)) {
        return url;
    }

    const siteUrl = getSiteURL().replace(/\/$/, '');
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${siteUrl}${path}`;
};

const doRequest = async <T>(path: string, options: RequestOptions): Promise<T> => {
    const requestOptions = Client4.getOptions({
        method: options.method,
        body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const response = await fetch(`${getSiteURL()}/plugins/${PLUGIN_ID}/api/v1${path}`, requestOptions);

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Request failed');
    }

    return response.json() as Promise<T>;
};

export type CreateCategoryShareLinkRequest = {
    readonly teamId: string;
    readonly categoryName: string;
    readonly channelIds: readonly string[];
};

export type CreateCategoryShareLinkResponse = {
    readonly token: string;
    readonly url: string;
};

export const createCategoryShareLink = async (
    _userId: string,
    payload: CreateCategoryShareLinkRequest,
): Promise<CreateCategoryShareLinkResponse> => {
    const response = await doRequest<CreateCategoryShareLinkResponse>('/share-links', {
        method: 'POST',
        body: payload as unknown as Record<string, unknown>,
    });
    return {
        ...response,
        url: normalizeShareUrl(response.url),
    };
};

export type CategoryShareLinkPreview = {
    readonly teamId: string;
    readonly categoryName: string;
    readonly channelIds: string[];
};

export const getCategoryShareLinkPreview = async (
    _userId: string,
    token: string,
): Promise<CategoryShareLinkPreview> => {
    return doRequest<CategoryShareLinkPreview>(`/share-links/${token}`, {
        method: 'GET',
    });
};

export type ApplyCategoryShareLinkResponse = {
    readonly categoryName: string;
    readonly joinedChannelIds: string[];
};

export const applyCategoryShareLink = async (
    _userId: string,
    token: string,
): Promise<ApplyCategoryShareLinkResponse> => {
    return doRequest<ApplyCategoryShareLinkResponse>(`/share-links/${token}/apply`, {
        method: 'POST',
    });
};
