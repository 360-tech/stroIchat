// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. #. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @channels @enterprise @partner_account @not_cloud

import * as TIMEOUTS from '../../../../fixtures/timeouts';

describe('Verify Partner User Identification in different screens', () => {
    let partnerUser: Cypress.UserProfile;
    let testChannel: Cypress.Channel;

    before(() => {
        cy.shouldNotRunOnCloudEdition();

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
            testChannel = channel;

            cy.apiCreatePartnerUser({}).then(({partner}) => {
                partnerUser = partner;
                cy.apiAddUserToTeam(team.id, partner.id).then(() => {
                    cy.apiAddUserToChannel(channel.id, partner.id);
                });
            });

            // # Login as regular user and visit the channel with partner
            cy.apiLogin(user);
            cy.visit(`/${team.name}/channels/${channel.name}`);
        });
    });

    it('MM-T1419 Deactivating a Partner removes "Channel has partners" message from channel header', () => {
        // * Verify the text 'Channel has partners' is displayed in the header
        cy.get('#channelHeaderDescription').within(($el) => {
            cy.wrap($el).find('.has-partner-header').should('be.visible').and('have.text', 'Channel has partners');
        });

        // # Deactivate Partner user
        cy.externalActivateUser(partnerUser.id, false);
        cy.wait(TIMEOUTS.FIVE_SEC);

        // # Switch channels away and back to reload the header
        cy.get('.SidebarChannel:contains(Town Square)').click();
        cy.get(`.SidebarChannel:contains(${testChannel.display_name})`).click();

        // * Verify the text 'Channel has partners' is removed from the header
        cy.get('#channelHeaderDescription').within(($el) => {
            cy.wrap($el).find('.has-partner-header').should('not.exist');
        });
    });
});
