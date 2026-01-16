// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package model

import (
	"net/http"
)

type PartnersInvite struct {
	Emails       []string `json:"emails"`
	Channels     []string `json:"channels"`
	Message      string   `json:"message"`
	PartnerSubtype string   `json:"partner_subtype"`
}

func (i *PartnersInvite) Auditable() map[string]any {
	return map[string]any{
		"emails":        i.Emails,
		"channels":      i.Channels,
		"partner_subtype": i.PartnerSubtype,
	}
}

// IsValid validates the user and returns an error if it isn't configured
// correctly.
func (i *PartnersInvite) IsValid() *AppError {
	if len(i.Emails) == 0 {
		return NewAppError("PartnersInvite.IsValid", "model.partner.is_valid.emails.app_error", nil, "", http.StatusBadRequest)
	}

	for _, email := range i.Emails {
		if len(email) > UserEmailMaxLength || email == "" || !IsValidEmail(email) {
			return NewAppError("PartnersInvite.IsValid", "model.partner.is_valid.email.app_error", nil, "email="+email, http.StatusBadRequest)
		}
	}

	if len(i.Channels) == 0 {
		return NewAppError("PartnersInvite.IsValid", "model.partner.is_valid.channels.app_error", nil, "", http.StatusBadRequest)
	}

	for _, channel := range i.Channels {
		if len(channel) != 26 {
			return NewAppError("PartnersInvite.IsValid", "model.partner.is_valid.channel.app_error", nil, "channel="+channel, http.StatusBadRequest)
		}
	}
	return nil
}
