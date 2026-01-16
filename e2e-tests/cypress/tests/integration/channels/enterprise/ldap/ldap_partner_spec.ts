// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. #. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @channels @enterprise @ldap

import {UserProfile} from '@mattermost/types/users';

import ldapUsers from '../../../../fixtures/ldap_users.json';
import * as TIMEOUTS from '../../../../fixtures/timeouts';
import {getAdminAccount} from '../../../../support/env';
import {getRandomId} from '../../../../utils';

// assumes that E20 license is uploaded
// for setup with AWS: Follow the instructions mentioned in the mattermost/platform-private/config/ldap-test-setup.txt file
describe('LDAP partner', () => {
    let testSettings;
    let user1Data;
    let user2Data;

    const user1 = ldapUsers['test-2'];
    const user2 = ldapUsers['test-3'];
    const userBoard1 = ldapUsers['board-1'];

    before(() => {
        // * Check if server has license for LDAP
        cy.apiRequireLicenseForFeature('LDAP');

        // # Test LDAP configuration and server connection
        // # Synchronize user attributes
        cy.apiLDAPTest();
        cy.apiLDAPSync();

        // # Get testSettings
        cy.apiGetConfig().then(({config}) => {
            testSettings = setLDAPTestSettings(config);
        });

        // # Get user1 data
        cy.apiLogin(user1 as unknown as UserProfile).then((user) => {
            user1Data = user;

            // # Remove user1 from all the teams
            removeUserFromAllTeams(user1Data);
        });

        // # Get user2 data
        cy.apiLogin(user2 as unknown as UserProfile).then((user) => {
            user2Data = user;

            // # Remove user2 fromm all the teams
            removeUserFromAllTeams(user2Data);
        });
    });

    beforeEach(() => {
        // # Login as admin
        cy.apiAdminLogin();

        // # Make sure LDAP users are not partners
        promotePartnerToUser(user1Data);
        promotePartnerToUser(user2Data);
    });

    it('MM-T1422 LDAP Partner Filter', () => {
        // # Go to LDAP settings page and update partner filter as user1
        gotoLDAPSettings();

        // # expand the filters section
        cy.findByTestId('LdapSettings.AdditionalFiltersbutton').click();
        updatePartnerFilter(`(uid=${user1.username})`);

        // # Login as LDAP user1
        testSettings.user = user1;
        cy.doLDAPLogin(testSettings);

        // * Verify select teams page is loaded
        cy.get('.select-team__container', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

        // * Verify user does not have access to any team or channel
        cy.get('.signup__content').should('have.text', 'Your partner account has no channels assigned. Please contact an administrator.');

        // # Logout of LDAP user
        cy.apiLogout().then(() => {
            // # Login as admin
            cy.apiAdminLogin();

            // # Go to LDAP settings page and EMPTY partner filter value
            gotoLDAPSettings();
            cy.findByTestId('LdapSettings.AdditionalFiltersbutton').click();
            updatePartnerFilter('');

            // # Login again as LDAP user1
            testSettings.user = user1;
            cy.doLDAPLogin(testSettings);

            // * Verify select teams page is loaded
            cy.get('.select-team__container', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

            // * Verify user1 is still a partner user
            cy.get('#createNewTeamLink').should('not.exist');

            cy.apiLogout().then(() => {
                // # Login again as LDAP user2
                testSettings.user = user2;
                cy.doLDAPLogin(testSettings);

                // * Verify select teams page is loaded
                cy.get('.select-team__container', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

                // * Verify user2 is not a partner
                cy.get('#createNewTeamLink').should('exist');
            });
        });
    });

    it('MM-T1424 LDAP Partner Filter behavior when Partner Access is disabled', () => {
        // # Go to Partner access page and enable partner access
        gotoPartnerAccessSettings();
        setPartnerAccess(true);

        // # Go to LDAP settings page and update partner filter as user1
        gotoLDAPSettings();
        cy.findByTestId('LdapSettings.AdditionalFiltersbutton').click();
        updatePartnerFilter(`(uid=${user1.username})`);

        // # Go to Partner access page and disable partner access
        gotoPartnerAccessSettings();
        setPartnerAccess(false);

        // # Go to LDAP settings page
        gotoLDAPSettings();
        cy.findByTestId('LdapSettings.PartnerFilterinput').should('have.attr', 'disabled');

        // # Go to SAML settings page
        cy.visit('/admin_console/authentication/saml');
        cy.get('.admin-console__header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('have.text', 'SAML 2.0');
        cy.findByTestId('SamlSettings.PartnerAttributeinput').should('be.disabled');

        // # Login again as LDAP user1
        testSettings.user = user1;
        cy.doLDAPLogin(testSettings);

        // * Verify select teams page is loaded
        cy.get('.select-team__container', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

        // * Verify user1 is not a partner
        cy.get('#createNewTeamLink').should('exist');
    });

    it('MM-T1425 LDAP Partner Filter Change', () => {
        // # Go to Partner access page and enable partner access
        gotoPartnerAccessSettings();
        setPartnerAccess(true);

        // # Login as LDAP user2
        testSettings.user = user2;
        cy.doLDAPLogin(testSettings);

        // # Create team if no membership
        cy.skipOrCreateTeam(testSettings, getRandomId()).then(() => {
            // * Verify user is a member
            cy.uiGetLHSAddChannelButton().should('exist');

            // # Demote the user
            demoteUserToPartner(user2Data);

            // # Logout of LDAP user
            cy.apiLogout().then(() => {
                // # Login again
                cy.doLDAPLogin(testSettings);

                // * Check if user is in the team
                cy.uiAddDirectMessage().should('exist');

                // * Check the user is a partner
                cy.uiGetLHSAddChannelButton().should('not.exist');
            });
        });
    });

    it('MM-T1427 Prevent Invite Partner for LDAP Group Synced Teams', () => {
        // # Create a new team
        cy.apiCreateTeam('team', 'Team').then(({team}) => {
            // # Get available ldap groups
            cy.apiGetLDAPGroups().then((result) => {
                // # Find "board" group
                const board = result.body.groups.find((group) => group.name === 'board');

                // # Link group
                cy.apiLinkGroup(board.primary_key).then(() => {
                    // # Add board-one to test team
                    cy.visit(`/admin_console/user_management/teams/${team.id}`);
                    cy.get('.admin-console__header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('have.text', 'Team Configuration');

                    // # Turn on sync group members
                    cy.findByTestId('syncGroupSwitch').scrollIntoView().click();

                    // # Add board group to team
                    cy.get('#addGroupsToTeamToggle').scrollIntoView().click();
                    cy.get('#multiSelectList').should('be.visible');
                    cy.get('#multiSelectList>div').children().eq(0).click();
                    cy.uiGetButton('Add').click();

                    // # Save settings
                    cy.get('#saveSetting').should('be.enabled').click();
                    cy.get('#genericModalLabel > span').should('be.visible').and('have.text', 'Save and remove 1 user?');

                    // # Accept confirmation modal
                    cy.get('#confirmModalButton').should('be.visible').click();
                    cy.get('.admin-console__header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('have.text', 'Mattermost Teams');

                    // # Login as board.one user
                    testSettings.user = userBoard1;
                    cy.doLDAPLogin(testSettings);

                    cy.wait(TIMEOUTS.TWO_SEC);

                    // # Go to the new team
                    cy.visit(`/${team.name}/channels/town-square`);

                    // # Open team menu and click 'Invite People'
                    cy.uiOpenTeamMenu('Invite people');

                    cy.wait(TIMEOUTS.TWO_SEC);
                    cy.get('#invitation_modal_title').should('be.visible');

                    // # Option to invite partner should not be visible
                    cy.findByTestId('invitePartnerLink').should('not.exist');
                });
            });
        });
    });
});

function gotoPartnerAccessSettings() {
    cy.visit('/admin_console/authentication/partner_access');
    cy.get('.admin-console__header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('have.text', 'Partner Access');
}

function gotoLDAPSettings() {
    // # Go to settings page and wait until page is loaded
    cy.visit('/admin_console/authentication/ldap');
    cy.get('.admin-console__header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('have.text', 'AD/LDAP Wizard');
}

function promotePartnerToUser(user) {
    // # Issue a Request to promote the partner to user
    // Ignoring the response status as it won't be 200 if user is not a partner
    cy.task('externalRequest', {
        user: getAdminAccount(),
        method: 'post',
        baseUrl: Cypress.config('baseUrl'),
        path: `users/${user.id}/promote`,
    });
}

function demoteUserToPartner(user) {
    // # Issue a Request to demote the user to partner
    cy.task('externalRequest', {
        user: getAdminAccount(),
        method: 'post',
        baseUrl: Cypress.config('baseUrl'),
        path: `users/${user.id}/demote`,
    });
}

function removeUserFromAllTeams(user: { id: string }) {
    // # Get all teams of a user
    cy.apiGetTeamsForUser(user.id).then((teams) => {
        // # Remove user from all the teams
        if (teams.length > 0) {
            teams.forEach((team: { id: string }) => {
                cy.apiDeleteUserFromTeam(team.id, user.id);
            });
        }
    });
}

function setPartnerAccess(enable) {
    const inputId = 'PartnerAccountsSettings.' + (enable ? 'Enabletrue' : 'Enablefalse');
    cy.findByTestId(inputId).then((elem) => {
        // Proceed only if it's not already checked
        if (!Cypress.$(elem).is(':checked')) {
            // # Check the radio button
            cy.findByTestId(inputId).check().should('be.checked');

            // # Save settings
            cy.findByTestId('saveSetting').click();

            if (!enable) {
                // # Confirm the modal button
                cy.get('#confirmModalButton').click();
            }
            waitUntilConfigSave();
        }
    });
}

function setLDAPTestSettings(config) {
    return {
        siteName: config.TeamSettings.SiteName,
        siteUrl: config.ServiceSettings.SiteURL,
        teamName: '',
        user: null,
    };
}

function updatePartnerFilter(value) {
    // # Set partner filter value
    if (value) {
        cy.findByTestId('LdapSettings.PartnerFilterinput').type(value);
    } else {
        cy.findByTestId('LdapSettings.PartnerFilterinput').clear();
    }

    // # Save config settings and wait until saved
    cy.findByTestId('saveSetting').click();
    waitUntilConfigSave();
}

// # Wait's until the Saving text becomes Save
const waitUntilConfigSave = () => {
    cy.waitUntil(() => cy.findByTestId('saveSetting').then((el) => {
        return el[0].innerText === 'Save';
    }));
};
