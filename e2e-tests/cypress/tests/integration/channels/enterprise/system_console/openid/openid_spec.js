// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @channels @enterprise @system_console

import * as TIMEOUTS from '../../../../../fixtures/timeouts';
import {hexToRgbArray, rgbArrayToString} from '../../../../../utils';

describe('System Console OpenId Connect', () => {
    const FAKE_SETTING = '********************************';
    const SERVICE_PROVIDER_LABEL = 'Select service provider:';
    const DISCOVERY_ENDPOINT_LABEL = 'Discovery Endpoint:';
    const CLIENT_ID_LABEL = 'Client ID:';
    const CLIENT_SECRET_LABEL = 'Client Secret:';
    const OPENID_LINK_NAME = 'OpenID Connect';
    const SAVE_BUTTON_NAME = 'Save';

    before(() => {
        // * Check if server has license
        cy.apiRequireLicense();
    });

    beforeEach(() => {
        // # Go to the System Scheme page as System Admin
        cy.apiAdminLogin();
        cy.visit('/admin_console');
    });

    it('MM-T3623 - Set to Generic OpenId', () => {
        cy.findByRole('link', {name: OPENID_LINK_NAME}).click();

        // # Click the OpenId header dropdown
        cy.wait(TIMEOUTS.FIVE_SEC);

        cy.findByLabelText(SERVICE_PROVIDER_LABEL).select('openid').wait(TIMEOUTS.ONE_SEC);

        cy.findByLabelText('Button Name:').clear().type('TestButtonTest');

        cy.get('#OpenIdSettings\\.ButtonColor-inputColorValue').clear().type('#c02222');

        cy.findByLabelText(DISCOVERY_ENDPOINT_LABEL).clear().type('http://test.com/.well-known/openid-configuration');
        cy.findByLabelText(CLIENT_ID_LABEL).clear().type('OpenIdId');
        cy.findByLabelText(CLIENT_SECRET_LABEL).clear().type('OpenIdSecret');

        cy.findByRole('button', {name: SAVE_BUTTON_NAME}).click().wait(TIMEOUTS.ONE_SEC);

        // * Get config from API
        cy.apiGetConfig().then(({config}) => {
            expect(config.OpenIdSettings.Secret).to.equal(FAKE_SETTING);
            expect(config.OpenIdSettings.Id).to.equal('OpenIdId');
            expect(config.OpenIdSettings.DiscoveryEndpoint).to.equal('http://test.com/.well-known/openid-configuration');
        });

        verifyOAuthLogin('TestButtonTest', '#c02222', Cypress.config('baseUrl') + '/oauth/openid/login');
    });

});

const verifyOAuthLogin = (text, color, href) => {
    cy.uiOpenSystemConsoleMainMenu('Log Out');

    cy.waitUntil(() => cy.url().then((url) => {
        return url.includes('/login');
    }));

    cy.url().then((url) => {
        const withExtra = url.includes('?extra=expired') ? '?extra=expired' : '';

        // * Verify oauth login link
        cy.get('.external-login-button').then((btn) => {
            expect(btn.prop('href')).equal(`${href}${withExtra}`);

            if (color) {
                const rbgArr = hexToRgbArray(color);
                expect(btn[0].style.color).equal(rgbArrayToString(rbgArr));
                expect(btn[0].style.borderColor).equal(rgbArrayToString(rbgArr));
            }

            cy.get('.external-login-button-label').should('contain', text);
        });
    });
};
