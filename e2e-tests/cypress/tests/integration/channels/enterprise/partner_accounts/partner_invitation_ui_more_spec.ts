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

import {getRandomId} from '../../../../utils';
import * as TIMEOUTS from '../../../../fixtures/timeouts';

import {
    changePartnerFeatureSettings,
    invitePeople,
    verifyInvitationError,
    verifyInvitationSuccess,
} from './helpers';

describe('Partner Account - Partner User Invitation Flow', () => {
    let testTeam: Cypress.Team;

    before(() => {
        // * Check if server has license for Partner Accounts
        cy.apiRequireLicenseForFeature('PartnerAccounts');
    });

    beforeEach(() => {
        // # Login as sysadmin
        cy.apiAdminLogin();

        // # Reset Partner Feature settings
        changePartnerFeatureSettings();

        cy.apiInitSetup().then(({team}) => {
            testTeam = team;

            // # Go to town square
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('MM-T1336 Invite Partners - Existing Team Member', () => {
        cy.apiCreateUser().then(({user: newUser}) => {
            cy.apiAddUserToTeam(testTeam.id, newUser.id).then(() => {
                // # Search and add an existing member by username who is part of the team
                invitePeople(newUser.username, 1, newUser.username);

                // * Verify the content and message in next screen
                verifyInvitationError(newUser.username, testTeam, 'This person is already a member of the workspace. Invite them as a member instead of a partner.');
            });
        });
    });

    it('MM-T1337 Invite Partners - Existing Team Partner', () => {
        cy.apiCreatePartnerUser({}).then(({partner}) => {
            cy.apiAddUserToTeam(testTeam.id, partner.id).then(() => {
                // # Search and add an existing partner by first name, who is part of the team but not channel
                invitePeople(partner.first_name, 1, partner.username, 'Off-Topic');

                // * Verify the content and message in next screen
                verifyInvitationSuccess(partner.username, testTeam, 'This partner has been added to the team and channel.');

                // # Search and add an existing partner by last name, who is part of the team and channel
                invitePeople(partner.last_name, 1, partner.username, 'Off-Topic');

                // * Verify the content and message in next screen
                verifyInvitationError(partner.username, testTeam, 'This person is already a member of all the channels.', true);
            });
        });
    });

    it('MM-T1338 Invite Partners - Existing Member not on the team', () => {
        cy.apiCreateUser().then(({user: regularUser}) => {
            // # Search and add an existing member by email who is not part of the team
            invitePeople(regularUser.email, 1, regularUser.username);

            // * Verify the content and message in next screen
            verifyInvitationError(regularUser.username, testTeam, 'This person is already a member of the workspace. Invite them as a member instead of a partner.');
        });
    });

    it('MM-T1339 Invite Partners - Existing Partner not on the team', () => {
        // # Search and add an existing partner by email, who is not part of the team
        cy.apiCreatePartnerUser({}).then(({partner}) => {
            invitePeople(partner.email, 1, partner.username);

            verifyInvitationSuccess(partner.username, testTeam, 'This partner has been added to the team and channel.', true);
        });
    });

    it('MM-T1340 Invite Partners - New User not in the system', () => {
        // # Search and add a new partner by email, who is not part of the team
        const email = `temp-${getRandomId()}@mattermost.com`;
        invitePeople(email, 1, email);

        // * Verify the content and message in next screen
        verifyInvitationSuccess(email, testTeam, 'An invitation email has been sent.');
    });

    it('MM-T1394 Change Email not whitelisted for Partner user', () => {
        // # Configure a whitelisted domain
        changePartnerFeatureSettings(true, true, 'example.com');

        // # Visit to newly created team
        cy.reload();
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Invite a Partner by email
        const email = `temp-${getRandomId()}@mattermost.com`;
        invitePeople(email, 1, email);

        // * Verify the content and message in next screen
        const expectedError = `The following email addresses do not belong to an accepted domain: ${email}. Please contact your System Administrator for details.`;
        verifyInvitationError(email, testTeam, expectedError);

        // # From System Console try to update email of partner user
        cy.apiCreatePartnerUser({}).then(({partner}) => {
            // # Navigate to System Console Users listing page
            cy.visit('/admin_console/user_management/users');

            // # Search for User by username and select the option to update email
            cy.findByPlaceholderText('Search users').should('be.visible').type(partner.username).wait(TIMEOUTS.ONE_SEC);

            // # Click on the option to update email
            cy.get('#systemUsersTable-cell-0_actionsColumn').click();
            cy.findByText('Update email').should('be.visible').click();

            // * Update email outside whitelisted domain and verify error message
            cy.findByTestId('resetEmailModal').should('be.visible').within(() => {
                cy.findByTestId('resetEmailForm').should('be.visible').get('input').type(email);
                cy.findByTestId('resetEmailButton').click();
                cy.get('.error').should('be.visible').and('have.text', 'The email you provided does not belong to an accepted domain for partner accounts. Please contact your administrator or sign up with a different email.');
                cy.get('.close').click();
            });
        });
    });
});
