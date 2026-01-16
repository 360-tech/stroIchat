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

import * as TIMEOUTS from '../../../../fixtures/timeouts';
import {getRandomId} from '../../../../utils';
import {getAdminAccount} from '../../../../support/env';

describe('Partner Account - Verify Manage Partner Users', () => {
    const admin = getAdminAccount();
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
        cy.findByPlaceholderText('Search users').should('be.visible').type(partnerUser.username).wait(TIMEOUTS.TWO_SEC);
    });

    it('MM-T1391 Verify the manage options displayed for Partner User', () => {
        // * Verify Partner user and Click on the Manage User option
        cy.get('#systemUsersTable-cell-0_actionsColumn').should('have.text', 'Partner').click();

        // * Verify the manage options which should be displayed for Partner User
        const includeOptions = ['Deactivate', 'Manage roles', 'Manage teams', 'Reset password', 'Update email', 'Promote to member', 'Remove sessions'];
        includeOptions.forEach((includeOption) => {
            cy.findByText(includeOption).should('be.visible');
        });

        // * Verify the manage options which should not be displayed for Partner user
        const missingOptions = ['Demote to Partner'];
        missingOptions.forEach((missingOption) => {
            cy.findByText(missingOption).should('not.exist');
        });
    });

    it('MM-18048 Change Email of a Partner User and Verify', () => {
        // # Click on the Update Email option
        cy.get('#systemUsersTable-cell-0_actionsColumn').should('have.text', 'Partner').click();
        cy.findByText('Update email').click();

        // * Update email of Partner User
        const email = `temp-${getRandomId()}@mattermost.com`;
        cy.findByTestId('resetEmailModal').should('be.visible').within(() => {
            cy.findByTestId('resetEmailForm').should('be.visible').get('input').type(email);
            cy.findByTestId('resetEmailButton').click();
        });

        // * Verify if Partner's email was updated
        cy.findByText(email).should('be.visible');

        // # Reload and verify if behavior is same
        cy.reload();
        cy.findByPlaceholderText('Search users').should('be.visible').type(partnerUser.username);
        cy.findByText(email).should('be.visible');
    });

    it('MM-18048 Revoke Session of a Partner User and Verify', () => {
        // # Click on the Revoke Session option
        cy.get('#systemUsersTable-cell-0_actionsColumn').should('have.text', 'Partner').click();
        cy.findByText('Remove sessions').click();

        // * Verify the confirmation message displayed
        cy.get('#confirmModal').should('be.visible').within(() => {
            cy.get('#genericModalLabel').should('be.visible').and('have.text', `Revoke Sessions for ${partnerUser.username}`);
            cy.get('.modal-body .ConfirmModal__body').should('be.visible').and('have.text', `This action revokes all sessions for ${partnerUser.username}. They will be logged out from all devices. Are you sure you want to revoke all sessions for ${partnerUser.username}?`);
        });

        // * Verify the behavior when Cancel button in the confirmation message is clicked
        cy.get('#cancelModalButton').click();
        cy.get('#confirmModal').should('not.exist');

        // # Logout sysadmin and login as Partner User to verify if Revoke Session works
        cy.apiLogout();
        cy.apiLogin(partnerUser);
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
        cy.get(`#sidebarItem_${testChannel.name}`).click({force: true});

        // # Issue a Request to Revoke All Sessions as SysAdmin
        cy.externalRequest({user: admin, method: 'post', path: `users/${partnerUser.id}/sessions/revoke/all`}).then(() => {
            // # Initiate browser activity like visit on test channel
            cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

            // * Verify if the regular member is logged out and redirected to login page
            cy.url({timeout: TIMEOUTS.HALF_MIN}).should('include', '/login');
            cy.get('.login-body-card', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible');
        });
    });
});
