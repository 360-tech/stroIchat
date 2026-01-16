// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package api4

import (
	"context"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/mattermost/mattermost/server/public/model"
)

func TestGetTeamAsPartner(t *testing.T) {
	th := Setup(t).InitBasic()
	defer th.TearDown()

	th.App.Srv().SetLicense(model.NewTestLicenseSKU(model.LicenseShortSkuEnterprise))
	th.App.UpdateConfig(func(cfg *model.Config) { *cfg.PartnerAccountsSettings.Enable = true })

	partner, partnerClient := th.CreatePartnerAndClient(t)

	publicTeamNotAMember := &model.Team{
		DisplayName:     "Public Team (partner is not a member)",
		Name:            GenerateTestTeamName(),
		Email:           th.GenerateTestEmail(),
		Type:            model.TeamOpen,
		AllowOpenInvite: true,
	}
	publicTeamNotAMember, _, err := th.SystemAdminClient.CreateTeam(context.Background(), publicTeamNotAMember)
	require.NoError(t, err)

	publicTeamIsAMember := &model.Team{
		DisplayName:     "Public Team (partner is a member)",
		Name:            GenerateTestTeamName(),
		Email:           th.GenerateTestEmail(),
		Type:            model.TeamOpen,
		AllowOpenInvite: true,
	}
	publicTeamIsAMember, _, err = th.SystemAdminClient.CreateTeam(context.Background(), publicTeamIsAMember)
	require.NoError(t, err)

	_, _, err = th.SystemAdminClient.AddTeamMember(context.Background(), publicTeamIsAMember.Id, partner.Id)
	require.NoError(t, err)

	privateTeamNotAMember := &model.Team{
		DisplayName:     "Private Team (partner is not a member)",
		Name:            GenerateTestTeamName(),
		Email:           th.GenerateTestEmail(),
		Type:            model.TeamInvite,
		AllowOpenInvite: false,
	}
	privateTeamNotAMember, _, err = th.SystemAdminClient.CreateTeam(context.Background(), privateTeamNotAMember)
	require.NoError(t, err)

	privateTeamIsAMember := &model.Team{
		DisplayName:     "Private Team (partner is a member)",
		Name:            GenerateTestTeamName(),
		Email:           th.GenerateTestEmail(),
		Type:            model.TeamInvite,
		AllowOpenInvite: false,
	}
	privateTeamIsAMember, _, err = th.SystemAdminClient.CreateTeam(context.Background(), privateTeamIsAMember)
	require.NoError(t, err)

	_, _, err = th.SystemAdminClient.AddTeamMember(context.Background(), privateTeamIsAMember.Id, partner.Id)
	require.NoError(t, err)

	t.Run("partner should not be able to get public team they are not a member of", func(t *testing.T) {
		_, resp, err := partnerClient.GetTeam(context.Background(), publicTeamNotAMember.Id, "")
		require.Error(t, err)
		assert.Equal(t, http.StatusForbidden, resp.StatusCode)
	})

	t.Run("partner should be able to get public team they are a member of", func(t *testing.T) {
		team, _, err := partnerClient.GetTeam(context.Background(), publicTeamIsAMember.Id, "")
		require.NoError(t, err)
		assert.Equal(t, publicTeamIsAMember.Id, team.Id)
	})

	t.Run("partner should not be able to get private team they are not a member of", func(t *testing.T) {
		_, resp, err := partnerClient.GetTeam(context.Background(), privateTeamNotAMember.Id, "")
		require.Error(t, err)
		assert.Equal(t, http.StatusForbidden, resp.StatusCode)
	})

	t.Run("partner should be able to get private team they are a member of", func(t *testing.T) {
		team, _, err := partnerClient.GetTeam(context.Background(), privateTeamIsAMember.Id, "")
		require.NoError(t, err)
		assert.Equal(t, privateTeamIsAMember.Id, team.Id)
	})
}
