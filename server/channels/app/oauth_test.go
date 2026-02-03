// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"fmt"
	"net/http"
	"net/url"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/v8/channels/store"
)

func TestGetOAuthAccessTokenForImplicitFlow(t *testing.T) {
	mainHelper.Parallel(t)
	th := Setup(t).InitBasic()
	defer th.TearDown()

	th.App.UpdateConfig(func(cfg *model.Config) { *cfg.ServiceSettings.EnableOAuthServiceProvider = true })

	oapp := &model.OAuthApp{
		Name:         "fakeoauthapp" + model.NewRandomString(10),
		CreatorId:    th.BasicUser2.Id,
		Homepage:     "https://nowhere.com",
		Description:  "test",
		CallbackUrls: []string{"https://nowhere.com"},
	}

	oapp, err := th.App.CreateOAuthApp(oapp)
	require.Nil(t, err)

	authRequest := &model.AuthorizeRequest{
		ResponseType: model.ImplicitResponseType,
		ClientId:     oapp.Id,
		RedirectURI:  oapp.CallbackUrls[0],
		Scope:        "",
		State:        "123",
	}

	session, err := th.App.GetOAuthAccessTokenForImplicitFlow(th.Context, th.BasicUser.Id, authRequest)
	assert.Nil(t, err)
	assert.NotNil(t, session)

	th.App.UpdateConfig(func(cfg *model.Config) { *cfg.ServiceSettings.EnableOAuthServiceProvider = false })

	session, err = th.App.GetOAuthAccessTokenForImplicitFlow(th.Context, th.BasicUser.Id, authRequest)
	assert.NotNil(t, err, "should fail - oauth2 disabled")
	assert.Nil(t, session)

	th.App.UpdateConfig(func(cfg *model.Config) { *cfg.ServiceSettings.EnableOAuthServiceProvider = true })
	authRequest.ClientId = "junk"

	session, err = th.App.GetOAuthAccessTokenForImplicitFlow(th.Context, th.BasicUser.Id, authRequest)
	assert.NotNil(t, err, "should fail - bad client id")
	assert.Nil(t, session)

	authRequest.ClientId = oapp.Id

	session, err = th.App.GetOAuthAccessTokenForImplicitFlow(th.Context, "junk", authRequest)
	assert.NotNil(t, err, "should fail - bad user id")
	assert.Nil(t, session)
}

func TestOAuthRevokeAccessToken(t *testing.T) {
	mainHelper.Parallel(t)
	th := Setup(t)
	defer th.TearDown()

	session := &model.Session{}
	session.CreateAt = model.GetMillis()
	session.UserId = model.NewId()
	session.Token = model.NewId()
	session.Roles = model.SystemUserRoleId
	th.App.SetSessionExpireInHours(session, 24)

	session, err := th.App.CreateSession(th.Context, session)
	require.Nil(t, err)
	err = th.App.RevokeAccessToken(th.Context, session.Token)
	require.NotNil(t, err, "Should have failed does not have an access token")
	require.Equal(t, http.StatusBadRequest, err.StatusCode)
}

func TestOAuthDeleteApp(t *testing.T) {
	mainHelper.Parallel(t)
	th := Setup(t)
	defer th.TearDown()

	*th.App.Config().ServiceSettings.EnableOAuthServiceProvider = true

	a1 := &model.OAuthApp{}
	a1.CreatorId = model.NewId()
	a1.Name = "TestApp" + model.NewId()
	a1.CallbackUrls = []string{"https://nowhere.com"}
	a1.Homepage = "https://nowhere.com"

	a1, appErr := th.App.CreateOAuthApp(a1)
	require.Nil(t, appErr)

	session := &model.Session{}
	session.CreateAt = model.GetMillis()
	session.UserId = model.NewId()
	session.Token = model.NewId()
	session.Roles = model.SystemUserRoleId
	session.IsOAuth = true
	th.App.ch.srv.platform.SetSessionExpireInHours(session, 24)

	session, appErr = th.App.CreateSession(th.Context, session)
	require.Nil(t, appErr)

	accessData := &model.AccessData{}
	accessData.Token = session.Token
	accessData.UserId = session.UserId
	accessData.RedirectUri = "http://example.com"
	accessData.ClientId = a1.Id
	accessData.ExpiresAt = session.ExpiresAt

	_, err := th.App.Srv().Store().OAuth().SaveAccessData(accessData)
	require.NoError(t, err)

	appErr = th.App.DeleteOAuthApp(th.Context, a1.Id)
	require.Nil(t, appErr)

	_, appErr = th.App.GetSession(session.Token)
	require.NotNil(t, appErr, "should not get session from cache or db")
}


func TestDeauthorizeOAuthApp(t *testing.T) {
	mainHelper.Parallel(t)
	th := Setup(t).InitBasic()
	defer th.TearDown()

	th.App.UpdateConfig(func(cfg *model.Config) { *cfg.ServiceSettings.EnableOAuthServiceProvider = true })

	oapp := &model.OAuthApp{
		Name:         "fakeoauthapp" + model.NewRandomString(10),
		CreatorId:    th.BasicUser2.Id,
		Homepage:     "https://nowhere.com",
		Description:  "test",
		CallbackUrls: []string{"https://nowhere.com"},
	}

	oapp, appErr := th.App.CreateOAuthApp(oapp)
	require.Nil(t, appErr)

	authRequest := &model.AuthorizeRequest{
		ResponseType: model.ImplicitResponseType,
		ClientId:     oapp.Id,
		RedirectURI:  oapp.CallbackUrls[0],
		Scope:        "",
		State:        "123",
	}

	redirectUrl, appErr := th.App.GetOAuthCodeRedirect(th.BasicUser.Id, authRequest)
	assert.Nil(t, appErr)

	dErr := th.App.DeauthorizeOAuthAppForUser(th.Context, th.BasicUser.Id, oapp.Id)
	assert.Nil(t, dErr)

	uri, uErr := url.Parse(redirectUrl)
	require.NoError(t, uErr)

	queryParams := uri.Query()
	code := queryParams.Get("code")

	data, err := th.App.Srv().Store().OAuth().GetAuthData(code)
	require.Equal(t, store.NewErrNotFound("AuthData", fmt.Sprintf("code=%s", code)), err)
	assert.Nil(t, data)
}

func TestDeactivatedUserOAuthApp(t *testing.T) {
	mainHelper.Parallel(t)
	th := Setup(t).InitBasic()
	defer th.TearDown()

	th.App.UpdateConfig(func(cfg *model.Config) { *cfg.ServiceSettings.EnableOAuthServiceProvider = true })

	oapp := &model.OAuthApp{
		Name:         "fakeoauthapp" + model.NewRandomString(10),
		CreatorId:    th.BasicUser2.Id,
		Homepage:     "https://nowhere.com",
		Description:  "test",
		CallbackUrls: []string{"https://nowhere.com"},
	}

	oapp, appErr := th.App.CreateOAuthApp(oapp)
	require.Nil(t, appErr)

	authRequest := &model.AuthorizeRequest{
		ResponseType: model.ImplicitResponseType,
		ClientId:     oapp.Id,
		RedirectURI:  oapp.CallbackUrls[0],
		Scope:        "",
		State:        "123",
	}

	redirectUrl, appErr := th.App.GetOAuthCodeRedirect(th.BasicUser.Id, authRequest)
	assert.Nil(t, appErr)

	uri, err := url.Parse(redirectUrl)
	require.NoError(t, err)

	queryParams := uri.Query()
	code := queryParams.Get("code")

	_, appErr = th.App.UpdateActive(th.Context, th.BasicUser, false)
	require.Nil(t, appErr)

	resp, appErr := th.App.GetOAuthAccessTokenForCodeFlow(th.Context, oapp.Id, model.AccessTokenGrantType, oapp.CallbackUrls[0], code, oapp.ClientSecret, "")
	assert.Nil(t, resp)
	require.NotNil(t, appErr, "Should not get access token")
	require.Equal(t, http.StatusBadRequest, appErr.StatusCode)
	assert.Equal(t, "api.oauth.get_access_token.expired_code.app_error", appErr.Id)
}
