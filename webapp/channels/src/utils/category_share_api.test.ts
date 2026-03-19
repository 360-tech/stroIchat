import {
    applyCategoryShareLink,
    createCategoryShareLink,
    getCategoryShareLinkPreview,
} from 'utils/category_share_api';

import {Client4} from 'mattermost-redux/client';

jest.mock('utils/url', () => ({
    getSiteURL: jest.fn(() => 'http://localhost:8065'),
}));

jest.mock('mattermost-redux/client', () => ({
    Client4: {
        getOptions: jest.fn((options: Record<string, unknown>) => options),
    },
}));

describe('utils/category_share_api', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        global.fetch = jest.fn();
        (Client4.getOptions as jest.Mock).mockImplementation((options: Record<string, unknown>) => options);
    });

    afterEach(() => {
        global.fetch = originalFetch;
        jest.clearAllMocks();
    });

    test('createCategoryShareLink calls plugin endpoint', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({token: 'abc', url: 'http://localhost:8065/category-share/abc'}),
        });

        const response = await createCategoryShareLink('user-id', {
            teamId: 'team-id',
            categoryName: 'Cat',
            channelIds: ['c1', 'c2'],
        });

        expect(response.token).toBe('abc');
        expect(response.url).toBe('http://localhost:8065/category-share/abc');
        expect(global.fetch).toHaveBeenCalledWith(
            'http://localhost:8065/plugins/com.company.category-share/api/v1/share-links',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({
                    teamId: 'team-id',
                    categoryName: 'Cat',
                    channelIds: ['c1', 'c2'],
                }),
            }),
        );
        expect(Client4.getOptions).toHaveBeenCalledWith(expect.objectContaining({method: 'POST'}));
    });

    test('createCategoryShareLink normalizes relative share url', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({token: 'abc', url: '/category-share/abc'}),
        });

        const response = await createCategoryShareLink('user-id', {
            teamId: 'team-id',
            categoryName: 'Cat',
            channelIds: ['c1'],
        });

        expect(response.url).toBe('http://localhost:8065/category-share/abc');
    });

    test('getCategoryShareLinkPreview calls preview endpoint', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({teamId: 't1', categoryName: 'Cat', channelIds: ['c1']}),
        });

        const response = await getCategoryShareLinkPreview('user-id', 'token1');
        expect(response.teamId).toBe('t1');
        expect(global.fetch).toHaveBeenCalledWith(
            'http://localhost:8065/plugins/com.company.category-share/api/v1/share-links/token1',
            expect.objectContaining({method: 'GET'}),
        );
        expect(Client4.getOptions).toHaveBeenCalledWith(expect.objectContaining({method: 'GET'}));
    });

    test('applyCategoryShareLink calls apply endpoint', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({categoryName: 'Cat', joinedChannelIds: ['c1']}),
        });

        const response = await applyCategoryShareLink('user-id', 'token2');
        expect(response.joinedChannelIds).toEqual(['c1']);
        expect(global.fetch).toHaveBeenCalledWith(
            'http://localhost:8065/plugins/com.company.category-share/api/v1/share-links/token2/apply',
            expect.objectContaining({method: 'POST'}),
        );
        expect(Client4.getOptions).toHaveBeenCalledWith(expect.objectContaining({method: 'POST'}));
    });
});
