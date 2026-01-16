// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. #. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @channels @enterprise @partner_account

/**
 * Note: This test requires Enterprise license to be uploaded
 */
import dayjs from 'dayjs';

import * as TIMEOUTS from '../../../../fixtures/timeouts';
import {getAdminAccount} from '../../../../support/env';

describe('Verify Partner User Identification in different screens', () => {
    const admin = getAdminAccount();
    let regularUser: Cypress.UserProfile;
    let partnerUser: Cypress.UserProfile;
    let testTeam: Cypress.Team;
    let testChannel: Cypress.Channel;

    before(() => {
        // * Check if server has license for Partner Accounts
        cy.apiRequireLicenseForFeature('PartnerAccounts');

        // # Enable PartnerAccountSettings
        cy.apiUpdateConfig({
            PartnerAccountsSettings: {
                Enable: true,
            },
            ServiceSettings: {
                EnableEmailInvitations: true,
            },
        });

        cy.apiInitSetup().then(({team, channel, user}) => {
            regularUser = user;
            testTeam = team;
            testChannel = channel;

            cy.apiCreatePartnerUser({}).then(({partner}) => {
                partnerUser = partner;
                cy.apiAddUserToTeam(testTeam.id, partnerUser.id).then(() => {
                    cy.apiAddUserToChannel(testChannel.id, partnerUser.id);
                });
            });

            // # Login as regular user and visit test channel
            cy.apiLogin(regularUser);
            cy.visit(`/${team.name}/channels/${testChannel.name}`);
        });
    });

    it('MM-T1370 Verify Partner Badge in Channel Members dropdown and dialog', () => {
        // # Open Channel Members RHS
        cy.get('#channelHeaderTitle').click();
        cy.get('#channelMembers').click().wait(TIMEOUTS.HALF_SEC);
        cy.uiGetRHS().findByTestId(`memberline-${partnerUser.id}`).within(($el) => {
            cy.wrap($el).get('.Tag').should('be.visible').should('have.text', 'GUEST');
        });
    });

    it('Verify Partner Badge in Team Members dialog', () => {
        // # Open team menu and click 'View Members'
        cy.uiOpenTeamMenu('View members');

        cy.get('#teamMembersModal').should('be.visible').within(($el) => {
            cy.wrap($el).findAllByTestId('userListItemDetails').each(($elChild) => {
                cy.wrap($elChild).invoke('text').then((username) => {
                    // * Verify Partner Badge in Channel Members List
                    if (username === partnerUser.username) {
                        cy.wrap($elChild).find('.Tag').should('be.visible').and('have.text', 'GUEST');
                    }
                });
            });

            // #Close Channel Members Dialog
            cy.wrap($el).find('.close').click();
        });
    });

    it('MM-T1372 Verify Partner Badge in Posts in Center Channel, RHS and User Profile Popovers', () => {
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        // # Get yesterdays date in UTC
        const yesterdaysDate = dayjs().subtract(1, 'days').valueOf();

        // # Post a day old message
        cy.postMessageAs({sender: partnerUser, message: 'Hello from yesterday', channelId: testChannel.id, createAt: yesterdaysDate}).
            its('id').
            should('exist').
            as('yesterdaysPost');

        // * Verify Partner Badge when partner user posts a message in Center Channel
        cy.get('@yesterdaysPost').then((postId) => {
            cy.get(`#post_${postId}`).within(($el) => {
                cy.wrap($el).find('.post__header .Tag').should('be.visible');
                cy.wrap($el).find('.post__header .user-popover').should('be.visible').click().wait(TIMEOUTS.HALF_SEC);
            });
        });

        // * Verify Partner Badge in Partner User's Profile Popover
        cy.get('div.user-profile-popover').should('be.visible').within(($el) => {
            cy.wrap($el).find('.PartnerTag').should('be.visible').and('have.text', 'GUEST');
        });
        cy.get('button.closeButtonRelativePosition').click();

        // # Close the profile popover
        cy.get('#channel-header').click();

        // # Open RHS comment menu
        cy.get('@yesterdaysPost').then((postId) => {
            cy.clickPostCommentIcon(postId.toString());

            // * Verify Partner Badge in RHS
            cy.get(`#rhsPost_${postId}`).within(($el) => {
                cy.wrap($el).find('.post__header .Tag').should('be.visible');
            });

            // # Close RHS
            cy.uiCloseRHS();
        });
    });

    it('Verify Partner Badge in Switch Channel Dialog', () => {
        // # Open Find Channels
        cy.uiOpenFindChannels();

        // # Type the partner user name on Channel switcher input
        cy.findByRole('combobox', {name: 'quick switch input'}).type(partnerUser.username).wait(TIMEOUTS.HALF_SEC);

        // * Verify if Partner badge is displayed for the partner user in the Switch Channel Dialog
        cy.get('#suggestionList').should('be.visible');
        cy.findByTestId(partnerUser.username).within(($el) => {
            cy.wrap($el).find('.Tag').should('be.visible').and('have.text', 'GUEST');
        });

        // # Close Dialog
        cy.get('#quickSwitchModal').within(() => {
            cy.get('button.close[aria-label="Close"]').click();
        });
    });

    it('MM-T1377 Verify Partner Badge in DM Search dialog', () => {
        // #Click on plus icon of Direct Messages
        cy.uiAddDirectMessage().click().wait(TIMEOUTS.HALF_SEC);

        // # Search for the Partner User
        cy.focused().type(partnerUser.username, {force: true}).wait(TIMEOUTS.HALF_SEC);
        cy.get('#multiSelectList').should('be.visible').within(($el) => {
            // * Verify if Partner badge is displayed in the DM Search
            cy.wrap($el).find('.Tag').should('be.visible').and('have.text', 'GUEST');
        });

        // # Close the Direct Messages dialog
        cy.get('#moreDmModal .close').click();
    });

    it('Verify Partner Badge in DM header and GM header', () => {
        // # Open a DM with Partner User
        cy.uiAddDirectMessage().click();
        cy.findByRole('dialog', {name: 'Direct Messages'}).should('be.visible').wait(TIMEOUTS.ONE_SEC);
        cy.findByRole('combobox', {name: 'Search for people'}).
            should('have.focused').
            typeWithForce(partnerUser.username).
            wait(TIMEOUTS.ONE_SEC).
            typeWithForce('{enter}');
        cy.uiGetButton('Go').click().wait(TIMEOUTS.HALF_SEC);

        // * Verify Partner Badge in DM header
        cy.get('#channelHeaderTitle').should('be.visible').find('.Tag').should('be.visible').and('have.text', 'GUEST');
        cy.get('#channelHeaderDescription').within(($el) => {
            cy.wrap($el).find('.has-partner-header').should('be.visible').and('have.text', 'Channel has partners');
        });

        // # Open a GM with Partner User and Sysadmin
        cy.uiAddDirectMessage().click();
        cy.findByRole('dialog', {name: 'Direct Messages'}).should('be.visible').wait(TIMEOUTS.ONE_SEC);
        cy.findByRole('combobox', {name: 'Search for people'}).
            should('have.focused').
            typeWithForce(partnerUser.username).
            wait(TIMEOUTS.ONE_SEC).
            typeWithForce('{enter}');
        cy.findByRole('combobox', {name: 'Search for people'}).
            should('have.focused').
            typeWithForce(admin.username).
            wait(TIMEOUTS.ONE_SEC).
            typeWithForce('{enter}');
        cy.uiGetButton('Go').click().wait(TIMEOUTS.HALF_SEC);

        // * Verify Partner Badge in GM header
        cy.get('#channelHeaderTitle').should('be.visible').find('.Tag').should('be.visible').and('have.text', 'GUEST');
        cy.get('#channelHeaderDescription').within(($el) => {
            cy.wrap($el).find('.has-partner-header').should('be.visible').and('have.text', 'This group message has partners');
        });
    });

    it('Verify Partner Badge in @mentions Autocomplete', () => {
        // # Start a draft in Channel containing "@user"
        cy.uiGetPostTextBox().type(`@${partnerUser.username}`);

        // * Verify Partner Badge is displayed at mention auto-complete
        cy.get('#suggestionList').should('be.visible');
        cy.findByTestId(`mentionSuggestion_${partnerUser.username}`).within(($el) => {
            cy.wrap($el).find('.Tag').should('be.visible').and('have.text', 'GUEST');
        });
    });

    it('Verify Partner Badge not displayed in Search Autocomplete', () => {
        // # Search for the Partner User
        cy.uiGetSearchContainer().click();
        cy.uiGetSearchBox().type('from:');

        // * Verify Partner Badge is not displayed at Search auto-complete
        cy.contains('.suggestion-list__item', partnerUser.username).scrollIntoView().should('be.visible').within(($el) => {
            cy.wrap($el).find('.Tag').should('not.exist');
        });

        // # Close and Clear the Search Autocomplete
        cy.findByTestId('searchBoxClose').click({force: true});
    });
});
