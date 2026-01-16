// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @channels @enterprise @system_console @channel_moderation

import {Channel} from '@mattermost/types/channels';
import {Team} from '@mattermost/types/teams';
import {UserProfile} from '@mattermost/types/users';

import * as TIMEOUTS from '../../../../../fixtures/timeouts';
import {getRandomId} from '../../../../../utils';
import {getAdminAccount} from '../../../../../support/env';

import {checkboxesTitleToIdMap} from './constants';
import {
    deleteOrEditTeamScheme,
    disablePermission,
    enablePermission,
    goToPermissionsAndCreateTeamOverrideScheme,
    goToSystemScheme,
    saveConfigForChannel,
    saveConfigForScheme,
    visitChannel,
    visitChannelConfigPage,
} from './helpers';

describe('MM-23102 - Channel Moderation - Post Reactions', () => {
    let regularUser: UserProfile;
    let partnerUser: UserProfile;
    let testTeam: Team;
    let testChannel: Channel;
    const admin = getAdminAccount();

    before(() => {
        // * Check if server has license
        cy.apiRequireLicense();

        cy.apiInitSetup().then(({team, channel, user}) => {
            regularUser = user;
            testTeam = team;
            testChannel = channel;

            cy.apiCreatePartnerUser({}).then(({partner}) => {
                partnerUser = partner;

                cy.apiAddUserToTeam(testTeam.id, partnerUser.id).then(() => {
                    cy.apiAddUserToChannel(testChannel.id, partnerUser.id);
                });

                // Post a few messages in the channel
                visitChannel(admin, testChannel, testTeam);
                for (let i = 0; i < 3; i++) {
                    cy.postMessage(`test message ${Date.now()}`);
                }
            });
        });
    });

    it('MM-T1543 Post Reactions option for Partners', () => {
        visitChannelConfigPage(testChannel);

        // # Uncheck the post reactions option for Partners and save
        disablePermission(checkboxesTitleToIdMap.POST_REACTIONS_GUESTS);
        saveConfigForChannel();

        // # Login as a Partner user and visit the same channel
        visitChannel(partnerUser, testChannel, testTeam);

        // # Check Partner user should not have the permission to react to any post on a channel when the option is removed.
        // * Partner user should not see the smiley face that allows a user to react to a post
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).trigger('mouseover');
            cy.findByTestId('post-reaction-emoji-icon').should('not.exist');
        });

        // # Visit test channel configuration page and enable post reactions for partner and save
        visitChannelConfigPage(testChannel);
        enablePermission(checkboxesTitleToIdMap.POST_REACTIONS_GUESTS);
        saveConfigForChannel();

        visitChannel(partnerUser, testChannel, testTeam);

        // # Check Partner user should have the permission to react to any post on a channel when the option is allowed.
        // * Partner user should see the smiley face that allows a user to react to a post
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).trigger('mouseover');
            cy.findByTestId('post-reaction-emoji-icon').should('exist');
        });
    });

    it('MM-T1544 Post Reactions option for Members', () => {
        visitChannelConfigPage(testChannel);

        // # Uncheck the Create reactions option for Members and save
        disablePermission(checkboxesTitleToIdMap.POST_REACTIONS_MEMBERS);
        saveConfigForChannel();

        // # Login as a Member user and visit the same channel
        visitChannel(regularUser, testChannel, testTeam);

        // # Check Member user should not have the permission to react to any post on a channel when the option is removed.
        // * Member user should not see the smiley face that allows a user to react to a post
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).trigger('mouseover');
            cy.findByTestId('post-reaction-emoji-icon').should('not.exist');
        });

        // # Visit test Channel configuration page and enable post reactions for members and save
        visitChannelConfigPage(testChannel);
        enablePermission(checkboxesTitleToIdMap.POST_REACTIONS_MEMBERS);
        saveConfigForChannel();

        // # Login as a Member user and visit the same channel
        visitChannel(regularUser, testChannel, testTeam);

        // # Check Member user should have the permission to react to any post on a channel when the option is allowed.
        // * Member user should see the smiley face that allows a user to react to a post
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).trigger('mouseover');
            cy.findByTestId('post-reaction-emoji-icon').should('exist');
        });
    });

    it('MM-T1545 Post Reactions option removed for Partners and Members in System Scheme', () => {
        // # Login as sysadmin and visit the Permissions page in the system console.
        // # Edit the System Scheme and remove the Post Reaction option for Partners & Save.
        goToSystemScheme();
        cy.get('.partner').should('be.visible').within(() => {
            cy.findByText('Post Reactions').click();
        });
        saveConfigForScheme();

        // # Visit the Channels page and click on a channel.
        visitChannelConfigPage(testChannel);

        // * Assert that post reaction is disabled for partner and not disabled for members and a message is displayed
        cy.findByTestId('admin-channel_settings-channel_moderation-postReactions-disabledPartner').
            should('exist').
            and('have.text', 'Post reactions for partners are disabled in System Scheme.');
        cy.findByTestId(checkboxesTitleToIdMap.POST_REACTIONS_MEMBERS).should('not.be.disabled');
        cy.findByTestId(checkboxesTitleToIdMap.POST_REACTIONS_GUESTS).should('be.disabled');

        // # Go to system admin page and then go to the system scheme and remove post reaction option for all members and save
        goToSystemScheme();
        cy.get('#all_users-posts-reactions').click();
        saveConfigForScheme();

        visitChannelConfigPage(testChannel);

        // * Post Reaction option should be disabled for a Members. A message Post reactions for partners & members are disabled in the System Scheme should be displayed.
        cy.findByTestId('admin-channel_settings-channel_moderation-postReactions-disabledBoth').
            should('exist').
            and('have.text', 'Post reactions for members and partners are disabled in System Scheme.');
        cy.findByTestId(checkboxesTitleToIdMap.POST_REACTIONS_MEMBERS).should('be.disabled');
        cy.findByTestId(checkboxesTitleToIdMap.POST_REACTIONS_GUESTS).should('be.disabled');

        // # Login as a Partner user and visit the same channel
        visitChannel(partnerUser, testChannel, testTeam);

        // # Check Partner User should not have the permission to react to any post on any channel when the option is removed from the System Scheme.
        // * Partner user should not see the smiley face that allows a user to react to a post
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).trigger('mouseover');
            cy.findByTestId('post-reaction-emoji-icon').should('not.exist');
        });

        // # Login as a Member user and visit the same channel
        visitChannel(regularUser, testChannel, testTeam);

        // # Check Member should not have the permission to react to any post on any channel when the option is removed from the System Scheme.
        // * Member user should not see the smiley face that allows a user to react to a post
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).trigger('mouseover');
            cy.findByTestId('post-reaction-emoji-icon').should('not.exist');
        });
    });

    // GUEST PERMISSIONS DON'T EXIST ON TEAM OVERRIDE SCHEMES SO GUEST PORTION NOT IMPLEMENTED!
    // ONLY THE MEMBERS PORTION OF THIS TEST IS IMPLEMENTED
    it('MM-T1546_4 Post Reactions option removed for Partners & Members in Team Override Scheme', () => {
        const teamOverrideSchemeName = `post_reactions_${getRandomId()}`;

        // # Create a new team override scheme
        goToPermissionsAndCreateTeamOverrideScheme(teamOverrideSchemeName, testTeam);

        visitChannelConfigPage(testChannel);

        // * Assert that post reaction is disabled for members
        cy.findByTestId(checkboxesTitleToIdMap.POST_REACTIONS_MEMBERS).should('have.class', 'checkbox checked');

        // # Login as a Member user and visit the same channel
        visitChannel(regularUser, testChannel, testTeam);

        // # Check Member should have the permission to react to any post on any channel in that team
        // * User should see the smiley face that allows a user to react to a post
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).trigger('mouseover');
            cy.findByTestId('post-reaction-emoji-icon').should('exist');
        });

        // # Go to system admin page and then go to the system scheme and remove post reaction option for all members and save
        deleteOrEditTeamScheme(teamOverrideSchemeName, 'edit');
        cy.get('#all_users-posts-reactions').click();
        saveConfigForScheme(false);

        // # Wait until the groups have been saved (since it redirects you)
        cy.wait(TIMEOUTS.ONE_SEC);

        visitChannelConfigPage(testChannel);

        // * Assert that post reaction is disabled for members
        cy.findByTestId(checkboxesTitleToIdMap.POST_REACTIONS_MEMBERS).should('have.class', 'checkbox disabled');

        // # Login as a Member user and visit the same channel
        visitChannel(regularUser, testChannel, testTeam);

        // # Check Member should not have the permission to react to any post on any channel in that team
        // * User should not see the smiley face that allows a user to react to a post
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).trigger('mouseover');
            cy.findByTestId('post-reaction-emoji-icon').should('not.exist');
        });
    });
});
