// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package model

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGuestsInviteAuditable(t *testing.T) {
	t.Run("should include guest_subtype in auditable data", func(t *testing.T) {
		invite := &GuestsInvite{
			Emails:       []string{"test@example.com"},
			Channels:     []string{"channel1", "channel2"},
			Message:      "Test message",
			GuestSubtype: GuestSubtypeContractor,
		}

		auditable := invite.Auditable()
		require.NotNil(t, auditable)
		assert.Equal(t, GuestSubtypeContractor, auditable["guest_subtype"])
		assert.Equal(t, []string{"test@example.com"}, auditable["emails"])
		assert.Equal(t, []string{"channel1", "channel2"}, auditable["channels"])
	})

	t.Run("should handle empty guest_subtype", func(t *testing.T) {
		invite := &GuestsInvite{
			Emails:       []string{"test@example.com"},
			Channels:     []string{"channel1"},
			GuestSubtype: "",
		}

		auditable := invite.Auditable()
		require.NotNil(t, auditable)
		assert.Equal(t, "", auditable["guest_subtype"])
	})
}

func TestGuestsInviteIsValid(t *testing.T) {
	t.Run("should validate valid invite", func(t *testing.T) {
		invite := &GuestsInvite{
			Emails:       []string{"test@example.com"},
			Channels:     []string{NewId()},
			GuestSubtype: GuestSubtypeContractor,
		}

		err := invite.IsValid()
		require.Nil(t, err)
	})

	t.Run("should reject empty emails", func(t *testing.T) {
		invite := &GuestsInvite{
			Emails:   []string{},
			Channels: []string{NewId()},
		}

		err := invite.IsValid()
		require.NotNil(t, err)
		assert.Equal(t, "model.guest.is_valid.emails.app_error", err.Id)
	})

	t.Run("should reject empty channels", func(t *testing.T) {
		invite := &GuestsInvite{
			Emails:   []string{"test@example.com"},
			Channels: []string{},
		}

		err := invite.IsValid()
		require.NotNil(t, err)
		assert.Equal(t, "model.guest.is_valid.channels.app_error", err.Id)
	})

	t.Run("should accept invite with any guest_subtype value", func(t *testing.T) {
		invite := &GuestsInvite{
			Emails:       []string{"test@example.com"},
			Channels:     []string{NewId()},
			GuestSubtype: "any_value",
		}

		err := invite.IsValid()
		require.Nil(t, err)
	})
}
