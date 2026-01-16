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

describe('Partner Accounts', () => {
    let partnerUser: Cypress.UserProfile;

    before(() => {
        cy.apiRequireLicenseForFeature('PartnerAccounts');

        cy.apiCreatePartnerUser({}).then(({partner}) => {
            partnerUser = partner;
        });
    });

    it('MM-T1411 Update Partner Users in User Management when Partner feature is disabled', () => {
        // # Navigate to Partner Access page.
        cy.visit('/admin_console/authentication/partner_access');

        // # Enable partner accounts.
        cy.findByTestId('PartnerAccountsSettings.Enabletrue').check();

        // # Click "Save".
        cy.get('#saveSetting').then((btn) => {
            if (btn.is(':enabled')) {
                btn.on('click', () => {});

                cy.waitUntil(() => cy.get('#saveSetting').then((el) => {
                    return el[0].innerText === 'Save';
                }));
            }
        });

        // # Ensure there are active Partner users.
        checkUserListStatus(partnerUser, 'Partner');

        // # Navigate to System Console ➜ Partner Access.
        cy.visit('/admin_console/authentication/partner_access');

        // # Set Enable Partner Access to false.
        cy.findByTestId('PartnerAccountsSettings.Enablefalse').check();

        // # Click "Save".
        cy.get('#saveSetting').scrollIntoView().click();
        cy.get('#confirmModal').should('be.visible').within(() => {
            cy.get('#confirmModalButton').should('have.text', 'Save and Disable Partner Access').click();
        });

        // * Partner users are shown as "Inactive".
        checkUserListStatus(partnerUser, 'Deactivated');

        // # Navigate to Partner Access page.
        cy.visit('/admin_console/authentication/partner_access');

        // # Enable partner accounts.
        cy.findByTestId('PartnerAccountsSettings.Enabletrue').check();

        // # Click "Save".
        cy.get('#saveSetting').scrollIntoView().click();

        // * Partner users are shown as "Deactivated".
        checkUserListStatus(partnerUser, 'Deactivated');
    });

    function checkUserListStatus(user, status) {
        // # Go to System Console ➜ Users.
        cy.visit('/admin_console/user_management/users');

        cy.get('#input_searchTerm').should('be.visible').type(user.username);
        cy.get('#actionMenuButton-systemUsersTable-0').should('have.text', status);
        cy.get('#systemUsersTable-cell-0_emailColumn').should('have.text', user.email);
    }
});
