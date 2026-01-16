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

import {verifyPartner} from './helpers';

describe('Partner Account - Verify Manage Partner Users', () => {
    let partnerUser: Cypress.UserProfile;
    let testTeam: Cypress.Team;
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
        });

        // # Create team and partner user account
        cy.apiInitSetup().then(({team, channel}) => {
            testTeam = team;
            testChannel = channel;

            cy.apiCreatePartnerUser({}).then(({partner}) => {
                partnerUser = partner;

                cy.apiAddUserToTeam(testTeam.id, partnerUser.id).then(() => {
                    cy.apiAddUserToChannel(testChannel.id, partnerUser.id);
                });
            });
        });

        // # Visit System Console Users page
        cy.visit('/admin_console/user_management/users');
    });

    beforeEach(() => {
        // # Reload current page before each test
        cy.reload();

        // # Search for Partner User by username
        cy.get('#input_searchTerm', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').type(partnerUser.username).wait(TIMEOUTS.TWO_SEC);
    });

    it('MM-18048 Deactivate Partner User and Verify', () => {
        // # Click on the Deactivate option
        cy.get('#actionMenuButton-systemUsersTable-0').click();
        cy.wait(TIMEOUTS.HALF_SEC).findByText('Deactivate').click();

        // * Verify the confirmation message displayed
        cy.get('#confirmModal').should('be.visible').within(() => {
            cy.get('#genericModalLabel').should('be.visible').and('have.text', `Deactivate ${partnerUser.username}`);
            cy.get('.modal-body .ConfirmModal__body').should('be.visible').and('have.text', `This action deactivates ${partnerUser.username}. They will be logged out and not have access to any teams or channels on this system.\nAre you sure you want to deactivate ${partnerUser.username}?`);
        });

        // * Verify the behavior when Cancel button in the confirmation message is clicked
        cy.get('#cancelModalButton').click();
        cy.get('#confirmModal').should('not.exist');
        verifyPartner();

        // * Verify the behavior when Deactivate button in the confirmation message is clicked
        cy.get('#actionMenuButton-systemUsersTable-0').click();
        cy.wait(TIMEOUTS.HALF_SEC).findByText('Deactivate').click();
        cy.get('#confirmModalButton').click();
        cy.get('#confirmModal').should('not.exist');
        verifyPartner('Deactivated');

        // # Reload and verify if behavior is same
        cy.reload();
        cy.get('#input_searchTerm').should('be.visible').type(partnerUser.username);
        verifyPartner('Deactivated');
    });

    it('MM-18048 Activate Partner User and Verify', () => {
        // # Click on the Activate option
        cy.get('#actionMenuButton-systemUsersTable-0').click();
        cy.wait(TIMEOUTS.HALF_SEC).findByText('Activate').click();

        // * Verify if User's status is activated again
        verifyPartner();

        // # Reload and verify if behavior is same
        cy.reload();
        cy.get('#input_searchTerm').should('be.visible').type(partnerUser.username);
        verifyPartner();
    });
});
