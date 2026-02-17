// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @channels @onboarding

import * as TIMEOUTS from '../../../fixtures/timeouts';
import {getRandomId} from '../../../utils';

const uniqueUserId = getRandomId();

function signupWithEmail(name, pw) {
    // # Go to /login
    cy.visit('/login');

    // # Click on sign up button
    cy.findByText('Don\'t have an account?', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').click();

    // # Type email address (by adding the uniqueUserId in the email address)
    cy.get('#input_email').type('unique.' + uniqueUserId + '@sample.mattermost.com');

    // # Type 'unique-1' for username
    cy.get('#input_name').type(name);

    // # Type 'unique1pw' for password
    cy.get('#input_password-input').type(pw);

    // # Click on Create Account button
    cy.findByText('Create Account').click();
}

