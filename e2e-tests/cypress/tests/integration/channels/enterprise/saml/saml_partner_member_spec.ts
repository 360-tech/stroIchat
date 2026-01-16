// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @channels @enterprise @saml

import * as TIMEOUTS from '../../../../fixtures/timeouts';
import {getRandomId} from '../../../../utils';

// assumes that E20 license is uploaded
// Update config.mk to make sure docker images for openldap and keycloak
//  - assumes openldap docker available on config default http://localhost:389
//  - assumes keycloak docker - uses api to update
// assumes the CYPRESS_* variables are set (CYPRESS_keycloakBaseUrl / CYPRESS_keycloakAppName)
// requires {"chromeWebSecurity": false}
// copy ./mattermost-server/build/docker/keycloak/keycloak.crt -> ./mattermost-webapp/e2e/cypress/tests/fixtures/keycloak.crt
describe('SAML Partner', () => {
    const loginButtonText = 'SAML';

    const partnerUser = {
        username: 'partner.test',
        password: 'Password1',
        email: 'partner.test@mmtest.com',
        firstname: 'Partner',
        lastname: 'OneSaml',
        keycloakId: '',
    };
    const userFilter = `username=${partnerUser.username}`;
    const keycloakBaseUrl = Cypress.env('keycloakBaseUrl') || 'http://localhost:8484';
    const keycloakAppName = Cypress.env('keycloakAppName') || 'mattermost';
    const idpUrl = `${keycloakBaseUrl}/auth/realms/${keycloakAppName}/protocol/saml`;
    const idpDescriptorUrl = `${keycloakBaseUrl}/auth/realms/${keycloakAppName}`;

    const newConfig = {
        PartnerAccountsSettings: {
            Enable: true,
        },
        SamlSettings: {
            Enable: true,
            EnableSyncWithLdap: false,
            EnableSyncWithLdapIncludeAuth: false,
            Verify: true,
            Encrypt: false,
            SignRequest: false,
            IdpURL: idpUrl,
            IdpDescriptorURL: idpDescriptorUrl,
            IdpMetadataURL: '',
            ServiceProviderIdentifier: `${Cypress.config('baseUrl')}/login/sso/saml`,
            AssertionConsumerServiceURL: `${Cypress.config('baseUrl')}/login/sso/saml`,
            SignatureAlgorithm: 'RSAwithSHA256',
            CanonicalAlgorithm: 'Canonical1.0',
            IdpCertificateFile: 'saml-idp.crt',
            PublicCertificateFile: '',
            PrivateKeyFile: '',
            IdAttribute: 'username',
            PartnerAttribute: '',
            EnableAdminAttribute: false,
            AdminAttribute: '',
            FirstNameAttribute: 'firstName',
            LastNameAttribute: 'lastName',
            EmailAttribute: 'email',
            UsernameAttribute: 'username',
            LoginButtonText: loginButtonText,
        },
    };

    let testSettings;

    before(() => {
        // * Check if server has license for SAML
        cy.apiRequireLicenseForFeature('SAML');

        // # Upload certificate, overwrite existing
        cy.apiUploadSAMLIDPCert('keycloak.crt');

        // # Update Configs
        cy.apiUpdateConfig(newConfig).then(({config}) => {
            cy.setTestSettings(loginButtonText, config).then((_response) => {
                testSettings = _response;
                cy.keycloakResetUsers([partnerUser]);
            });
        });
    });

    it('MM-T1423_1 - SAML Partner Setting disabled if Partner Access is turned off', () => {
        // # Visit saml settings
        cy.visit('/admin_console/authentication/saml');

        // # Turn on Partner Attribute Filter
        cy.findByTestId('SamlSettings.PartnerAttributeinput').clear().type('username=e2etest.one');

        // # Save SAML Settings
        cy.findByText('Save').click().wait(TIMEOUTS.ONE_SEC);

        // # Visit Partner Access settings
        cy.visit('/admin_console/authentication/partner_access');

        // # Turn off Partner Access
        cy.findByTestId('PartnerAccountsSettings.Enablefalse').check();

        // # Save Partner Access Settings
        cy.findByText('Save').click().wait(TIMEOUTS.ONE_SEC);

        // # Handle confirmation model
        cy.findByText('Save and Disable Partner Access').click().wait(TIMEOUTS.ONE_SEC);

        // # Visit saml settings
        cy.visit('/admin_console/authentication/saml');

        // * verify Partner Attribute is disabled.
        cy.findByTestId('SamlSettings.PartnerAttributeinput').should('be.disabled');
    });

    it('MM-T1423_2 - SAML User will login as member', () => {
        const testConfig = {
            ...newConfig,
            PartnerAccountsSettings: {
                Enable: false,
            },
        };
        cy.apiAdminLogin().then(() => {
            cy.apiUpdateConfig(testConfig);
        });

        testSettings.user = partnerUser;

        // # MM Login via SAML
        cy.doSamlLogin(testSettings).then(() => {
            // # Login to Keycloak
            cy.doKeycloakLogin(testSettings.user).then(() => {
                // # Create team if no membership
                cy.skipOrCreateTeam(testSettings, getRandomId()).then(() => {
                    // * check the user is member, if can create public channel
                    cy.get('#SidebarContainer .AddChannelDropdown_dropdownButton').click();
                    cy.get('#showNewChannel button').should('exist');
                });
            });
        });
    });

    it('MM-T1426_1 - User logged in as member, filter does not match', () => {
        const testConfig = {
            ...newConfig,
            PartnerAccountsSettings: {
                ...newConfig.PartnerAccountsSettings,
                Enable: true,
            },
            SamlSettings: {
                ...newConfig.SamlSettings,
                PartnerAttribute: 'username=Wrong',
            },
        };
        cy.apiAdminLogin().then(() => {
            cy.apiUpdateConfig(testConfig);
        });

        testSettings.user = partnerUser;

        // # MM Login via SAML
        cy.doSamlLogin(testSettings).then(() => {
            // # Login to Keycloak
            cy.doKeycloakLogin(testSettings.user).then(() => {
                // # Create team if no membership
                cy.skipOrCreateTeam(testSettings, getRandomId()).then(() => {
                    // * check the user is member, if can create public channel
                    cy.get('#SidebarContainer .AddChannelDropdown_dropdownButton').click();
                    cy.get('#showNewChannel button').should('exist');
                });
            });
        });
    });

    it('MM-T1426_2 - User logged in as partner, correct filter', () => {
        const testConfig = {
            ...newConfig,
            PartnerAccountsSettings: {
                ...newConfig.PartnerAccountsSettings,
                Enable: true,
            },
            SamlSettings: {
                ...newConfig.SamlSettings,
                PartnerAttribute: userFilter,
            },
        };
        cy.apiAdminLogin().then(() => {
            cy.apiUpdateConfig(testConfig);
        });

        testSettings.user = partnerUser;

        // # MM Login via SAML
        cy.doSamlLogin(testSettings).then(() => {
            // # Login to Keycloak
            cy.doKeycloakLogin(testSettings.user).then(() => {
                // # Create team if no membership
                cy.skipOrCreateTeam(testSettings, getRandomId()).then(() => {
                    // * check the user is partner, cannot create public channel
                    cy.get('#SidebarContainer .AddChannelDropdown_dropdownButton').should('not.exist');
                });
            });
        });
    });
});

