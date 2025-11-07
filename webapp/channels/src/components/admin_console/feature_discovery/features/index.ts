// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import AnnouncementBannerFeatureDiscovery from './announcement_banner';
import GitLabFeatureDiscovery from './gitlab';
import GroupsFeatureDiscovery from './groups';
import GuestAccessFeatureDiscovery from './guest_access';
import LDAPFeatureDiscovery from './ldap';
import MobileSecurityFeatureDiscovery from './mobile_security';
import OpenIDFeatureDiscovery from './openid';
import OpenIDCustomFeatureDiscovery from './openid_custom';
import SAMLFeatureDiscovery from './saml';
import SystemRolesFeatureDiscovery from './system_roles';

export {
    LDAPFeatureDiscovery,
    SAMLFeatureDiscovery,
    OpenIDFeatureDiscovery,
    OpenIDCustomFeatureDiscovery,
    GitLabFeatureDiscovery,
    AnnouncementBannerFeatureDiscovery,
    GuestAccessFeatureDiscovery,
    SystemRolesFeatureDiscovery,
    GroupsFeatureDiscovery,
    MobileSecurityFeatureDiscovery,
};
