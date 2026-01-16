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

import {createPrivateChannel} from '../elasticsearch_autocomplete/helpers';
import * as TIMEOUTS from '../../../../fixtures/timeouts';

describe('Partner Account - Partner User Experience', () => {
    let partnerUser: Cypress.UserProfile;
    let privateChannel: Cypress.Channel;
    let testTeam: Cypress.Team;

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

        // # Create User and Team
        cy.apiInitSetup({userPrefix: 'partner'}).then(({user, team}) => {
            partnerUser = user;
            testTeam = team;
        });
    });

    it('MM-T1369 System message when user is added specifies the partner status', () => {
        // # Demote Partner user if applicable
        demotePartnerUser(partnerUser);

        // # Ceate a new team
        cy.apiCreateTeam('test-team2', 'Test Team2').then(({team: teamTwo}) => {
            // # Add the partner user to this team
            cy.apiAddUserToTeam(teamTwo.id, partnerUser.id).then(() => {
                // # Login as partner user
                cy.apiLogin(partnerUser);
                cy.reload();
            });
        });

        // # Create Private Channel
        createPrivateChannel(testTeam.id, partnerUser).then((channel) => {
            privateChannel = channel;

            cy.visit(`/${testTeam.name}/channels/${privateChannel.name}`);
        });

        // * The system message should contain 'added to the channel as a partner'
        cy.getLastPostId().then((id) => {
            cy.get(`#postMessageText_${id}`).should('contain', `@${partnerUser.username} added to the channel as a partner`);
        });
    });

    it('MM-T1397 Partner tag in search in:', () => {
        demotePartnerUser(partnerUser);

        cy.apiAdminLogin();
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.sendDirectMessageToUser(partnerUser, 'hello');

        // # Search for the Partner User
        cy.uiGetSearchContainer().click();
        cy.uiGetSearchBox().wait(TIMEOUTS.FIVE_SEC).type(`in:${partnerUser.username}`);

        // * Verify Partner Badge is not displayed at Search auto-complete
        cy.contains('.suggestion-list__item', partnerUser.username).should('be.visible').within(($el) => {
            cy.wrap($el).find('.Tag').should('not.exist');
        });
    });
});

function demotePartnerUser(partnerUser) {
    // # Demote user as partner user before each test
    cy.apiAdminLogin();
    cy.apiGetUserByEmail(partnerUser.email).then(({user}) => {
        if (user.roles !== 'system_partner') {
            cy.apiDemoteUserToPartner(partnerUser.id);
        }
    });
}
