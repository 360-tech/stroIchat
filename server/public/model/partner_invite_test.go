// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package model

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestPartnersInviteAuditable(t *testing.T) {
	t.Run("should include partner_subtype in auditable data", func(t *testing.T) {
		invite := &PartnersInvite{
			Emails:       []string{"test@example.com"},
			Channels:     []string{"channel1", "channel2"},
			Message:      "Test message",
			PartnerSubtype: PartnerSubtypeContractor,
		}

		auditable := invite.Auditable()
		require.NotNil(t, auditable)
		assert.Equal(t, PartnerSubtypeContractor, auditable["partner_subtype"])
		assert.Equal(t, []string{"test@example.com"}, auditable["emails"])
		assert.Equal(t, []string{"channel1", "channel2"}, auditable["channels"])
	})

	t.Run("should handle empty partner_subtype", func(t *testing.T) {
		invite := &PartnersInvite{
			Emails:       []string{"test@example.com"},
			Channels:     []string{"channel1"},
			PartnerSubtype: "",
		}

		auditable := invite.Auditable()
		require.NotNil(t, auditable)
		assert.Equal(t, "", auditable["partner_subtype"])
	})
}

func TestPartnersInviteIsValid(t *testing.T) {
	t.Run("should validate valid invite", func(t *testing.T) {
		invite := &PartnersInvite{
			Emails:       []string{"test@example.com"},
			Channels:     []string{NewId()},
			PartnerSubtype: PartnerSubtypeContractor,
		}

		err := invite.IsValid()
		require.Nil(t, err)
	})

	t.Run("should reject empty emails", func(t *testing.T) {
		invite := &PartnersInvite{
			Emails:   []string{},
			Channels: []string{NewId()},
		}

		err := invite.IsValid()
		require.NotNil(t, err)
		assert.Equal(t, "model.partner.is_valid.emails.app_error", err.Id)
	})

	t.Run("should reject empty channels", func(t *testing.T) {
		invite := &PartnersInvite{
			Emails:   []string{"test@example.com"},
			Channels: []string{},
		}

		err := invite.IsValid()
		require.NotNil(t, err)
		assert.Equal(t, "model.partner.is_valid.channels.app_error", err.Id)
	})

	t.Run("should accept invite with any partner_subtype value", func(t *testing.T) {
		invite := &PartnersInvite{
			Emails:       []string{"test@example.com"},
			Channels:     []string{NewId()},
			PartnerSubtype: "any_value",
		}

		err := invite.IsValid()
		require.Nil(t, err)
	})
}
