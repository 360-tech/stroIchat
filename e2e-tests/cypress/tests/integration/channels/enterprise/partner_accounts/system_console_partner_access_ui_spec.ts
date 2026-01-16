// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. #. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @channels @enterprise @partner_account @mfa

/**
 * Note: This test requires Enterprise license to be uploaded
 */

import * as TIMEOUTS from '../../../../fixtures/timeouts';

describe('Partner Account - Verify Partner Access UI', () => {
    beforeEach(() => {
        // * Check if server has license for Partner Accounts
        cy.apiRequireLicenseForFeature('PartnerAccounts');

        // # Enable PartnerAccountSettings
        cy.apiUpdateConfig({
            PartnerAccountsSettings: {
                Enable: true,
            },
            ServiceSettings: {
                EnableMultifactorAuthentication: false,
            },
        });

        // # Visit System Console Users page
        cy.visit('/admin_console/authentication/partner_access');
    });

    it('MM-18046 Verify Partner Access Screen', () => {
        // * Verify Enable Partner Access field
        cy.findByTestId('PartnerAccountsSettings.Enable').should('be.visible').within(() => {
            cy.get('.control-label').should('be.visible').and('have.text', 'Enable Partner Access: ');
        });
        cy.findByTestId('PartnerAccountsSettings.Enablehelp-text').should('be.visible').and('have.text', 'When true, external partner can be invited to channels within teams. Please see Permissions Schemes for which roles can invite partners.');

        // * Verify Whitelisted Partner Domains field
        cy.findByTestId('PartnerAccountsSettings.RestrictCreationToDomains').should('be.visible').within(() => {
            cy.get('.control-label').should('be.visible').and('have.text', 'Whitelisted Partner Domains:');
        });
        cy.findByTestId('PartnerAccountsSettings.RestrictCreationToDomainshelp-text').should('be.visible').and('have.text', '(Optional) Partner accounts can be created at the system level from this list of allowed partner domains.');

        // * Verify Partner MFA field when System MFA is not enabled
        cy.findByTestId('PartnerAccountsSettings.EnforceMultifactorAuthentication').should('be.visible').within(() => {
            cy.get('.control-label').should('be.visible').and('have.text', 'Enforce Multi-factor Authentication: ');
        });
        cy.findByTestId('PartnerAccountsSettings.EnforceMultifactorAuthenticationhelp-text').should('be.visible').and('have.text', 'Multi-factor authentication is currently not enabled.');

        // # Enable PartnerAccountSettings
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableMultifactorAuthentication: true,
            },
        });

        // # Visit System Console Users page
        cy.visit('/admin_console/authentication/partner_access');

        // * Verify Partner MFA field when System MFA is enabled
        cy.findByTestId('PartnerAccountsSettings.EnforceMultifactorAuthenticationhelp-text').should('be.visible').and('have.text', 'Multi-factor authentication is currently not enforced.');
    });

    it('MM-T1410 Confirmation Modal when Partner Access is disabled', () => {
        // # Disable Partner Access and save
        cy.findByTestId('PartnerAccountsSettings.Enablefalse').click();

        // * Verify the warning message
        cy.get('.error-message').should('be.visible').within(() => {
            cy.findByText('All current partner account sessions will be revoked, and marked as inactive').should('be.visible');
        });

        // # Click on the Save Settings
        cy.get('#saveSetting').should('be.visible').click();

        // * Verify the confirmation message displayed
        cy.get('#confirmModal').should('be.visible').within(() => {
            cy.get('#genericModalLabel').should('be.visible').and('have.text', 'Save and Disable Partner Access?');
            cy.get('.ConfirmModal__body').should('be.visible').and('have.text', 'Disabling partner access will revoke all current Partner Account sessions. Partners will no longer be able to login and new partners cannot be invited into Mattermost. Partner users will be marked as inactive in user lists. Enabling this feature will not reinstate previous partner accounts. Are you sure you wish to remove these users?');
            cy.get('#confirmModalButton').should('have.text', 'Save and Disable Partner Access');
        });

        // * Verify the behavior when Cancel button in the confirmation message is clicked
        cy.get('#cancelModalButton').click();
        cy.get('#confirmModal').should('not.exist');
        cy.get('.error-message').should('be.visible');

        // # Click on the Save Settings, confirm and wait for some time to complete successful save
        cy.get('#saveSetting').should('be.visible').click();
        cy.get('#confirmModalButton').should('be.visible').click().wait(TIMEOUTS.TWO_SEC);

        // # Visit the chat facing application
        cy.get('.header__info').should('be.visible').click();
        cy.findByLabelText('Admin Console Menu').should('exist').within(() => {
            cy.findByText('Switch to eligendi').click();
        });

        // # Open team menu and click 'Invite People'
        cy.uiOpenTeamMenu('Invite people');

        // * Verify that an option to Invite via Partner should not be available
        cy.findByTestId('invitePartnerLink').should('not.exist');
        cy.get('.users-emails-input__control').should('be.visible');
    });
});
