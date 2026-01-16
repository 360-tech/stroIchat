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

function demotePartnerUser(partnerUser) {
    // # Demote user as partner user before each test
    cy.apiAdminLogin();
    cy.apiGetUserByEmail(partnerUser.email).then(({user}) => {
        if (user.roles !== 'system_partner') {
            cy.apiDemoteUserToPartner(partnerUser.id);
        }
    });
}

describe('Partner Account - Partner User Experience', () => {
    let partnerUser: Cypress.UserProfile;

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

        cy.apiInitSetup({userPrefix: 'partner'}).then(({user, team, channel}) => {
            partnerUser = user;

            // # Create new team and visit its URL
            cy.apiDemoteUserToPartner(user.id).then(() => {
                cy.apiAddUserToTeam(team.id, partnerUser.id).then(() => {
                    cy.apiAddUserToChannel(channel.id, partnerUser.id).then(() => {
                        cy.apiLogin(partnerUser);
                        cy.visit(`/${team.name}/channels/${channel.name}`);
                    });
                });
            });
        });
    });

    it('MM-T1354 Verify Partner User Restrictions', () => {
        // # Open team menu
        cy.uiOpenTeamMenu();

        // * Verify reduced options in Team Menu
        const missingMainOptions = [
            'Invite people',
            'Team settings',
            'Manage members',
            'Join another team',
            'Create a team',
        ];
        missingMainOptions.forEach((missingOption) => {
            cy.uiGetLHSTeamMenu().should('not.contain', missingOption);
        });

        const includeMainOptions = [
            'View members',
            'Leave team',
        ];
        includeMainOptions.forEach((includeOption) => {
            cy.uiGetLHSTeamMenu().findByText(includeOption);
        });

        // # Close the main menu
        cy.get('body').type('{esc}');

        // * Verify Reduced Options in LHS
        cy.uiGetLHSAddChannelButton().should('not.exist');

        // * Verify Partner Badge in Channel Header
        cy.get('#channelHeaderDescription').within(($el) => {
            cy.wrap($el).find('.has-partner-header').should('be.visible').and('have.text', 'Channel has partners');
        });

        // * Verify list of Users in Direct Messages Dialog
        cy.uiAddDirectMessage().click().wait(TIMEOUTS.FIVE_SEC);
        cy.get('#multiSelectList').should('be.visible').within(($el) => {
            // * Verify only 2 users - Partner and sysadmin are listed
            cy.wrap($el).children().should('have.length', 2);
        });
        cy.uiClose();

        // * Verify Partner Badge when partner user posts a message
        cy.postMessage('testing');
        cy.getLastPostId().then((postId) => {
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

        // * Verify Partner User can see only 1 additional channel in LHS plus off-topic and off-topic
        cy.uiGetLhsSection('CHANNELS').find('.SidebarChannel').should('have.length', 3);

        // * Verify list of Users a Partner User can see in Team Members dialog
        cy.uiOpenTeamMenu('View members');
        cy.get('#searchableUserListTotal').should('be.visible').and('have.text', '1 - 2 members of 2 total');
    });

    it('MM-18049 Verify Partner User Restrictions is removed when promoted', () => {
        // # Promote a Partner user to a member and reload
        cy.apiAdminLogin();
        cy.apiPromotePartnerToUser(partnerUser.id);

        // # Login as partner user
        cy.apiLogin(partnerUser);
        cy.reload();

        // * Verify options in team menu are changed
        cy.uiOpenTeamMenu();
        const includeOptions = [
            'Invite people',
            'View members',
            'Leave team',
            'Create a team',
        ];
        includeOptions.forEach((option) => {
            cy.uiGetLHSTeamMenu().findByText(option);
        });

        // Close the main menu with Escape key
        cy.get('body').type('{esc}');
        cy.uiGetLHSTeamMenu().should('not.exist');

        // * Verify Options in LHS are changed
        cy.uiGetLHSAddChannelButton();

        // * Verify Partner Badge in Channel Header is removed
        cy.get('#sidebarItem_off-topic').click();
        cy.get('#channelIntro').should('be.visible');
        cy.get('#channelHeaderDescription').within(($el) => {
            cy.wrap($el).find('.has-partner-header').should('not.exist');
        });

        // * Verify Partner Badge is removed when user posts a message
        cy.get('#sidebarItem_off-topic').click({force: true});
        cy.postMessage('testing');
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).within(($el) => {
                cy.wrap($el).find('.post__header .Tag').should('not.exist');
                cy.wrap($el).find('.post__header .user-popover').should('be.visible').click().wait(TIMEOUTS.HALF_SEC);
            });
        });

        // * Verify Partner Badge is not displayed in User's Profile Popover
        cy.get('div.user-profile-popover').should('be.visible').within(($el) => {
            cy.wrap($el).find('.user-popover__role').should('not.exist');
        });
        cy.get('button.closeButtonRelativePosition').click();

        // # Close the profile popover
        cy.get('#channel-header').click();
    });

    it('MM-T1417 Add Partner User to New Team from System Console', () => {
        // # Demote Partner user if applicable
        demotePartnerUser(partnerUser);

        // # Create a new team
        cy.apiCreateTeam('test-team2', 'Test Team2').then(({team: teamTwo}) => {
            // # Add the partner user to this team
            cy.apiAddUserToTeam(teamTwo.id, partnerUser.id).then(() => {
                // # Login as partner user
                cy.apiLogin(partnerUser);
                cy.reload();

                // # Click team button
                cy.get(`#${teamTwo.name}TeamButton`, {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').click();

                // * Verify if Channel Not found is displayed
                cy.findByText('Channel Not Found').should('be.visible');
                cy.findByText('Your partner account has no channels assigned. Please contact an administrator.').should('be.visible');
                cy.findByText('Back').should('be.visible').click();

                // * Verify if user is redirected to a valid channel
                cy.findByTestId('post_textbox').should('be.visible');
            });
        });
    });

    it('MM-T1412 Revoke Partner User Sessions when Partner feature is disabled', () => {
        // # Demote Partner user if applicable
        demotePartnerUser(partnerUser);

        // # Disable Partner Access
        cy.apiUpdateConfig({
            PartnerAccountsSettings: {
                Enable: false,
            },
        });

        // # Wait for page to load and then logout
        cy.uiGetPostTextBox().wait(TIMEOUTS.TWO_SEC);
        cy.apiLogout();
        cy.visit('/');

        // # Login with partner user credentials and check the error message
        cy.get('#input_loginId').type(partnerUser.username);
        cy.get('#input_password-input').type('passwd');
        cy.get('#saveSetting').should('not.be.disabled').click();

        // * Verify if partner account is deactivated
        cy.findByText('Login failed because your account has been deactivated. Please contact an administrator.').should('be.visible');
    });
});
