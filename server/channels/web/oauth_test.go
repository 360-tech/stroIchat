// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package web

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"slices"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/shared/request"
)

func TestOAuthComplete_AccessDenied(t *testing.T) {
	th := Setup(t).InitBasic(t)

	c := &Context{
		App: th.App,
		Params: &Params{
			Service: "TestService",
		},
		AppContext: request.EmptyContext(th.TestLogger),
	}
	responseWriter := httptest.NewRecorder()
	request, err := http.NewRequest(http.MethodGet, th.App.GetSiteURL()+"/signup/TestService/complete?error=access_denied", nil)
	require.NoError(t, err)

	completeOAuth(c, responseWriter, request)

	response := responseWriter.Result()

	assert.Equal(t, http.StatusTemporaryRedirect, response.StatusCode)

	location, err := url.Parse(response.Header.Get("Location"))
	require.NoError(t, err)
	assert.Equal(t, "oauth_access_denied", location.Query().Get("type"))
	assert.Equal(t, "TestService", location.Query().Get("service"))
}

func TestAuthorizeOAuthApp(t *testing.T) {
	th := Setup(t).InitBasic(t)
	th.Login(t, apiClient, th.SystemAdminUser)

	enableOAuth := *th.App.Config().ServiceSettings.EnableOAuthServiceProvider
	defer func() {
		th.App.UpdateConfig(func(cfg *model.Config) { *cfg.ServiceSettings.EnableOAuthServiceProvider = enableOAuth })
	}()

	th.App.UpdateConfig(func(cfg *model.Config) { *cfg.ServiceSettings.EnableOAuthServiceProvider = true })

	oapp := &model.OAuthApp{
		Name:         GenerateTestAppName(),
		Homepage:     "https://nowhere.com",
		Description:  "test",
		CallbackUrls: []string{"https://nowhere.com"},
		CreatorId:    th.SystemAdminUser.Id,
	}

	rapp, appErr := th.App.CreateOAuthApp(oapp)
	require.Nil(t, appErr)

	authRequest := &model.AuthorizeRequest{
		ResponseType: model.AuthCodeResponseType,
		ClientId:     rapp.Id,
		RedirectURI:  rapp.CallbackUrls[0],
		Scope:        "",
		State:        "123",
	}

	// Test auth code flow
	ruri, _, err := apiClient.AuthorizeOAuthApp(context.Background(), authRequest)
	require.NoError(t, err)

	require.NotEmpty(t, ruri, "redirect url should be set")

	ru, err := url.Parse(ruri)
	require.NoError(t, err)
	require.NotNil(t, ru, "redirect url unparseable")
	require.NotEmpty(t, ru.Query().Get("code"), "authorization code not returned")
	require.Equal(t, ru.Query().Get("state"), authRequest.State, "returned state doesn't match")

	// Test implicit flow
	authRequest.ResponseType = model.ImplicitResponseType
	ruri, _, err = apiClient.AuthorizeOAuthApp(context.Background(), authRequest)
	require.NoError(t, err)
	require.False(t, ruri == "", "redirect url should be set")

	ru, err = url.Parse(ruri)
	require.NoError(t, err)
	require.NotNil(t, ru, "redirect url unparseable")
	values, err := url.ParseQuery(ru.Fragment)
	require.NoError(t, err)
	assert.False(t, values.Get("access_token") == "", "access_token not returned")
	assert.Equal(t, authRequest.State, values.Get("state"), "returned state doesn't match")

	oldToken := apiClient.AuthToken
	apiClient.AuthToken = values.Get("access_token")
	_, resp, err := apiClient.AuthorizeOAuthApp(context.Background(), authRequest)
	require.Error(t, err)
	CheckForbiddenStatus(t, resp)

	apiClient.AuthToken = oldToken

	authRequest.RedirectURI = ""
	_, resp, err = apiClient.AuthorizeOAuthApp(context.Background(), authRequest)
	require.Error(t, err)
	CheckBadRequestStatus(t, resp)

	authRequest.RedirectURI = "http://somewhereelse.com"
	_, resp, err = apiClient.AuthorizeOAuthApp(context.Background(), authRequest)
	require.Error(t, err)
	CheckBadRequestStatus(t, resp)

	authRequest.RedirectURI = rapp.CallbackUrls[0]
	authRequest.ResponseType = ""
	_, resp, err = apiClient.AuthorizeOAuthApp(context.Background(), authRequest)
	require.Error(t, err)
	CheckBadRequestStatus(t, resp)

	authRequest.ResponseType = model.AuthCodeResponseType
	authRequest.ClientId = ""
	_, resp, err = apiClient.AuthorizeOAuthApp(context.Background(), authRequest)
	require.Error(t, err)
	CheckBadRequestStatus(t, resp)

	authRequest.ClientId = model.NewId()
	_, resp, err = apiClient.AuthorizeOAuthApp(context.Background(), authRequest)
	require.Error(t, err)
	CheckNotFoundStatus(t, resp)

	// test callback URI doesn't have malformed query parameters
	oappWithQueryParamInCallback := &model.OAuthApp{
		Name:         GenerateTestAppName(),
		Homepage:     "https://nowhere.com",
		Description:  "test",
		CallbackUrls: []string{"https://nowhere.com?simply=lovely"},
		CreatorId:    th.SystemAdminUser.Id,
	}

	rapp, appErr = th.App.CreateOAuthApp(oappWithQueryParamInCallback)
	require.Nil(t, appErr)

	authRequest = &model.AuthorizeRequest{
		ResponseType: model.AuthCodeResponseType,
		ClientId:     rapp.Id,
		RedirectURI:  rapp.CallbackUrls[0],
		Scope:        "",
		State:        "/oauthcallback?sesskey=abcd&other=123",
	}
	uriResponse, _, err := apiClient.AuthorizeOAuthApp(context.Background(), authRequest)
	require.NoError(t, err)
	ru, err = url.Parse(uriResponse)
	require.NoError(t, err)
	require.NotEmpty(t, uriResponse, "redirect url should be set")
	require.NotNil(t, ru, "redirect url unparseable")
	// require no query parameter to have "?"
	require.False(t, strings.Contains(ru.RawQuery, "?"), "should not malform query parameters")
	require.NotEmpty(t, ru.Query().Get("code"), "authorization code not returned")

	// test state is not encoded multiple times
	require.Equal(t, ru.Query().Get("state"), authRequest.State, "returned state doesn't match")
	// test state is URL encoded at least once
	require.Empty(t, ru.Query().Get("other"), "state's query parameters should not leak")
}

func TestDeauthorizeOAuthApp(t *testing.T) {
	th := Setup(t).InitBasic(t)
	th.Login(t, apiClient, th.SystemAdminUser)

	enableOAuth := th.App.Config().ServiceSettings.EnableOAuthServiceProvider
	defer func() {
		th.App.UpdateConfig(func(cfg *model.Config) { cfg.ServiceSettings.EnableOAuthServiceProvider = enableOAuth })
	}()
	th.App.UpdateConfig(func(cfg *model.Config) { *cfg.ServiceSettings.EnableOAuthServiceProvider = true })

	oapp := &model.OAuthApp{
		Name:         GenerateTestAppName(),
		Homepage:     "https://nowhere.com",
		Description:  "test",
		CallbackUrls: []string{"https://nowhere.com"},
		CreatorId:    th.SystemAdminUser.Id,
	}

	rapp, appErr := th.App.CreateOAuthApp(oapp)
	require.Nil(t, appErr)

	authRequest := &model.AuthorizeRequest{
		ResponseType: model.AuthCodeResponseType,
		ClientId:     rapp.Id,
		RedirectURI:  rapp.CallbackUrls[0],
		Scope:        "",
		State:        "123",
	}

	_, _, err := apiClient.AuthorizeOAuthApp(context.Background(), authRequest)
	require.NoError(t, err)

	_, err = apiClient.DeauthorizeOAuthApp(context.Background(), rapp.Id)
	require.NoError(t, err)

	resp, err := apiClient.DeauthorizeOAuthApp(context.Background(), "junk")
	require.Error(t, err)
	CheckBadRequestStatus(t, resp)

	_, err = apiClient.DeauthorizeOAuthApp(context.Background(), model.NewId())
	require.NoError(t, err)

	th.Logout(apiClient)
	resp, err = apiClient.DeauthorizeOAuthApp(context.Background(), rapp.Id)
	require.Error(t, err)
	CheckUnauthorizedStatus(t, resp)
}

func TestOAuthAccessToken(t *testing.T) {
	if testing.Short() {
		t.SkipNow()
	}

	th := Setup(t).InitBasic(t)
	th.Login(t, apiClient, th.SystemAdminUser)

	enableOAuth := th.App.Config().ServiceSettings.EnableOAuthServiceProvider
	defer func() {
		th.App.UpdateConfig(func(cfg *model.Config) { cfg.ServiceSettings.EnableOAuthServiceProvider = enableOAuth })
	}()
	th.App.UpdateConfig(func(cfg *model.Config) { *cfg.ServiceSettings.EnableOAuthServiceProvider = true })

	defaultRolePermissions := th.SaveDefaultRolePermissions()
	defer func() {
		th.RestoreDefaultRolePermissions(defaultRolePermissions)
	}()
	th.AddPermissionToRole(model.PermissionManageOAuth.Id, model.TeamUserRoleId)
	th.AddPermissionToRole(model.PermissionManageOAuth.Id, model.SystemUserRoleId)

	oauthApp := &model.OAuthApp{
		Name:         "TestApp5" + model.NewId(),
		Homepage:     "https://nowhere.com",
		Description:  "test",
		CallbackUrls: []string{"https://nowhere.com"},
		CreatorId:    th.SystemAdminUser.Id,
	}
	oauthApp, appErr := th.App.CreateOAuthApp(oauthApp)
	require.Nil(t, appErr)

	th.App.UpdateConfig(func(cfg *model.Config) { *cfg.ServiceSettings.EnableOAuthServiceProvider = false })
	data := url.Values{"grant_type": []string{"junk"}, "client_id": []string{"12345678901234567890123456"}, "client_secret": []string{"12345678901234567890123456"}, "code": []string{"junk"}, "redirect_uri": []string{oauthApp.CallbackUrls[0]}}

	_, _, err := apiClient.GetOAuthAccessToken(context.Background(), data)
	require.Error(t, err, "should have failed - oauth providing turned off")
	th.App.UpdateConfig(func(cfg *model.Config) { *cfg.ServiceSettings.EnableOAuthServiceProvider = true })

	authRequest := &model.AuthorizeRequest{
		ResponseType: model.AuthCodeResponseType,
		ClientId:     oauthApp.Id,
		RedirectURI:  oauthApp.CallbackUrls[0],
		Scope:        "all",
		State:        "123",
	}

	redirect, _, err := apiClient.AuthorizeOAuthApp(context.Background(), authRequest)
	require.NoError(t, err)
	rurl, err := url.Parse(redirect)
	require.NoError(t, err)

	data = url.Values{"grant_type": []string{"junk"}, "client_id": []string{oauthApp.Id}, "client_secret": []string{oauthApp.ClientSecret}, "code": []string{rurl.Query().Get("code")}, "redirect_uri": []string{oauthApp.CallbackUrls[0]}}
	_, resp, err := apiClient.GetOAuthAccessToken(context.Background(), data)
	require.Error(t, err, "should have failed - bad grant type")
	CheckBadRequestStatus(t, resp)

	data.Set("grant_type", model.AccessTokenGrantType)
	data.Set("client_id", "")
	_, _, err = apiClient.GetOAuthAccessToken(context.Background(), data)
	require.Error(t, err, "should have failed - missing client id")

	data.Set("client_id", "junk")
	_, _, err = apiClient.GetOAuthAccessToken(context.Background(), data)
	require.Error(t, err, "should have failed - bad client id")

	data.Set("client_id", oauthApp.Id)
	data.Set("client_secret", "")
	_, _, err = apiClient.GetOAuthAccessToken(context.Background(), data)
	require.Error(t, err, "should have failed - missing client secret")

	data.Set("client_secret", "junk")
	_, _, err = apiClient.GetOAuthAccessToken(context.Background(), data)
	require.Error(t, err, "should have failed - bad client secret")

	data.Set("client_secret", oauthApp.ClientSecret)
	data.Set("code", "")
	_, _, err = apiClient.GetOAuthAccessToken(context.Background(), data)
	require.Error(t, err, "should have failed - missing code")

	data.Set("code", "junk")
	_, _, err = apiClient.GetOAuthAccessToken(context.Background(), data)
	require.Error(t, err, "should have failed - bad code")

	data.Set("code", rurl.Query().Get("code"))
	data.Set("redirect_uri", "junk")
	_, _, err = apiClient.GetOAuthAccessToken(context.Background(), data)
	require.Error(t, err, "should have failed - non-matching redirect uri")

	// reset data for successful request
	data.Set("grant_type", model.AccessTokenGrantType)
	data.Set("client_id", oauthApp.Id)
	data.Set("client_secret", oauthApp.ClientSecret)
	data.Set("code", rurl.Query().Get("code"))
	data.Set("redirect_uri", oauthApp.CallbackUrls[0])

	token := ""
	refreshToken := ""
	rsp, _, err := apiClient.GetOAuthAccessToken(context.Background(), data)
	require.NoError(t, err)
	require.NotEmpty(t, rsp.AccessToken, "access token not returned")
	require.NotEmpty(t, rsp.RefreshToken, "refresh token not returned")
	token, refreshToken = rsp.AccessToken, rsp.RefreshToken
	require.Equal(t, rsp.TokenType, model.AccessTokenType, "access token type incorrect")

	_, err = apiClient.DoAPIGet(context.Background(), "/oauth_test", "")
	require.NoError(t, err)

	apiClient.SetOAuthToken("")
	_, err = apiClient.DoAPIGet(context.Background(), "/oauth_test", "")
	require.Error(t, err, "should have failed - no access token provided")

	apiClient.SetOAuthToken("badtoken")
	_, err = apiClient.DoAPIGet(context.Background(), "/oauth_test", "")
	require.Error(t, err, "should have failed - bad token provided")

	apiClient.SetOAuthToken(token)
	_, err = apiClient.DoAPIGet(context.Background(), "/oauth_test", "")
	require.NoError(t, err)

	_, _, err = apiClient.GetOAuthAccessToken(context.Background(), data)
	require.Error(t, err, "should have failed - tried to reuse auth code")

	data.Set("grant_type", model.RefreshTokenGrantType)
	data.Set("client_id", oauthApp.Id)
	data.Set("client_secret", oauthApp.ClientSecret)
	data.Set("refresh_token", "")
	data.Set("redirect_uri", oauthApp.CallbackUrls[0])
	data.Del("code")
	_, _, err = apiClient.GetOAuthAccessToken(context.Background(), data)
	require.Error(t, err, "Should have failed - refresh token empty")

	data.Set("refresh_token", refreshToken)
	rsp, _, err = apiClient.GetOAuthAccessToken(context.Background(), data)
	require.NoError(t, err)
	require.NotEmpty(t, rsp.AccessToken, "access token not returned")
	require.NotEmpty(t, rsp.RefreshToken, "refresh token not returned")
	require.NotEqual(t, rsp.RefreshToken, refreshToken, "refresh token did not update")
	require.Equal(t, rsp.TokenType, model.AccessTokenType, "access token type incorrect")

	apiClient.SetOAuthToken(rsp.AccessToken)
	_, err = apiClient.DoAPIGet(context.Background(), "/oauth_test", "")
	require.NoError(t, err)

	data.Set("refresh_token", rsp.RefreshToken)
	rsp, _, err = apiClient.GetOAuthAccessToken(context.Background(), data)
	require.NoError(t, err)
	require.NotEmpty(t, rsp.AccessToken, "access token not returned")
	require.NotEmpty(t, rsp.RefreshToken, "refresh token not returned")
	require.NotEqual(t, rsp.RefreshToken, refreshToken, "refresh token did not update")
	require.Equal(t, rsp.TokenType, model.AccessTokenType, "access token type incorrect")

	apiClient.SetOAuthToken(rsp.AccessToken)
	_, err = apiClient.DoAPIGet(context.Background(), "/oauth_test", "")
	require.NoError(t, err)

	authData := &model.AuthData{ClientId: oauthApp.Id, RedirectUri: oauthApp.CallbackUrls[0], UserId: th.BasicUser.Id, Code: model.NewId(), ExpiresIn: -1}
	_, err = th.App.Srv().Store().OAuth().SaveAuthData(authData)
	require.NoError(t, err)

	data.Set("grant_type", model.AccessTokenGrantType)
	data.Set("client_id", oauthApp.Id)
	data.Set("client_secret", oauthApp.ClientSecret)
	data.Set("redirect_uri", oauthApp.CallbackUrls[0])
	data.Set("code", authData.Code)
	data.Del("refresh_token")
	_, _, err = apiClient.GetOAuthAccessToken(context.Background(), data)
	require.Error(t, err, "Should have failed - code is expired")

	apiClient.ClearOAuthToken()
}

func HTTPGet(url string, httpClient *http.Client, authToken string, followRedirect bool) (*http.Response, error) {
	rq, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	rq.Close = true

	if authToken != "" {
		rq.Header.Set(model.HeaderAuth, authToken)
	}

	if !followRedirect {
		httpClient.CheckRedirect = func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		}
	}

	rp, err := httpClient.Do(rq)
	if err != nil {
		return nil, err
	} else if rp.StatusCode == 304 {
		return rp, nil
	} else if rp.StatusCode == 307 {
		return rp, nil
	} else if rp.StatusCode >= 300 {
		defer closeBody(rp)
		return rp, model.AppErrorFromJSON(rp.Body)
	}
	return rp, nil
}

func closeBody(r *http.Response) {
	if r != nil && r.Body != nil {
		_, _ = io.ReadAll(r.Body) // Discard and ignore errors - just draining the body
		r.Body.Close()
	}
}

type MattermostTestProvider struct {
}

func (m *MattermostTestProvider) GetUserFromJSON(_ request.CTX, data io.Reader, tokenUser *model.User) (*model.User, error) {
	var user model.User
	if err := json.NewDecoder(data).Decode(&user); err != nil {
		return nil, err
	}
	user.AuthData = &user.Email
	return &user, nil
}

func (m *MattermostTestProvider) GetUserFromIdToken(_ request.CTX, token string) (*model.User, error) {
	return nil, nil
}

func (m *MattermostTestProvider) IsSameUser(_ request.CTX, dbUser, oauthUser *model.User) bool {
	return dbUser.AuthData == oauthUser.AuthData
}

func GenerateTestAppName() string {
	return "fakeoauthapp" + model.NewRandomString(10)
}

func checkHTTPStatus(t *testing.T, resp *model.Response, expectedStatus int) {
	t.Helper()

	require.NotNilf(t, resp, "Unexpected nil response, expected http status:%v", expectedStatus)

	require.Equalf(t, expectedStatus, resp.StatusCode, "Expected http status:%v, got %v", expectedStatus, resp.StatusCode)
}

func CheckForbiddenStatus(t *testing.T, resp *model.Response) {
	t.Helper()
	checkHTTPStatus(t, resp, http.StatusForbidden)
}

func CheckUnauthorizedStatus(t *testing.T, resp *model.Response) {
	t.Helper()
	checkHTTPStatus(t, resp, http.StatusUnauthorized)
}

func CheckNotFoundStatus(t *testing.T, resp *model.Response) {
	t.Helper()
	checkHTTPStatus(t, resp, http.StatusNotFound)
}

func CheckBadRequestStatus(t *testing.T, resp *model.Response) {
	t.Helper()
	checkHTTPStatus(t, resp, http.StatusBadRequest)
}

func (th *TestHelper) Login(tb testing.TB, client *model.Client4, user *model.User) {
	tb.Helper()

	session := &model.Session{
		UserId:  user.Id,
		Roles:   user.GetRawRoles(),
		IsOAuth: false,
	}
	session, appErr := th.App.CreateSession(th.Context, session)
	require.Nil(tb, appErr)
	client.AuthToken = session.Token
	client.AuthType = model.HeaderBearer
}

func (th *TestHelper) Logout(client *model.Client4) {
	client.AuthToken = ""
}

func (th *TestHelper) SaveDefaultRolePermissions() map[string][]string {
	results := make(map[string][]string)

	for _, roleName := range []string{
		"system_user",
		"system_admin",
		"team_user",
		"team_admin",
		"channel_user",
		"channel_admin",
	} {
		role, err1 := th.App.GetRoleByName(th.Context, roleName)
		if err1 != nil {
			panic(err1)
		}

		results[roleName] = role.Permissions
	}
	return results
}

func (th *TestHelper) RestoreDefaultRolePermissions(data map[string][]string) {
	for roleName, permissions := range data {
		role, err1 := th.App.GetRoleByName(th.Context, roleName)
		if err1 != nil {
			panic(err1)
		}

		if strings.Join(role.Permissions, " ") == strings.Join(permissions, " ") {
			continue
		}

		role.Permissions = permissions

		_, err2 := th.App.UpdateRole(role)
		if err2 != nil {
			panic(err2)
		}
	}
}

// func (th *TestHelper) RemovePermissionFromRole(permission string, roleName string) {
// 	utils.DisableDebugLogForTest()

// 	role, err1 := th.App.GetRoleByName(roleName)
// 	if err1 != nil {
// 		utils.EnableDebugLogForTest()
// 		panic(err1)
// 	}

// 	var newPermissions []string
// 	for _, p := range role.Permissions {
// 		if p != permission {
// 			newPermissions = append(newPermissions, p)
// 		}
// 	}

// 	if strings.Join(role.Permissions, " ") == strings.Join(newPermissions, " ") {
// 		utils.EnableDebugLogForTest()
// 		return
// 	}

// 	role.Permissions = newPermissions

// 	_, err2 := th.App.UpdateRole(role)
// 	if err2 != nil {
// 		utils.EnableDebugLogForTest()
// 		panic(err2)
// 	}

// 	utils.EnableDebugLogForTest()
// }

func (th *TestHelper) AddPermissionToRole(permission string, roleName string) {
	role, err1 := th.App.GetRoleByName(th.Context, roleName)
	if err1 != nil {
		panic(err1)
	}

	if slices.Contains(role.Permissions, permission) {
		return
	}

	role.Permissions = append(role.Permissions, permission)

	_, err2 := th.App.UpdateRole(role)
	if err2 != nil {
		panic(err2)
	}
}

func TestFullyQualifiedRedirectURL(t *testing.T) {
	const siteURL = "https://xxx.yyy/mm"

	for target, expected := range map[string]string{
		"":                                     siteURL,
		"/":                                    siteURL + "/",
		"some-path":                            siteURL + "/some-path",
		"/some-path":                           siteURL + "/some-path",
		"/some-path/":                          siteURL + "/some-path/",
		"/some-path?foo=bar":                   siteURL + "/some-path?foo=bar",
		"/some-path#section":                   siteURL + "/some-path#section",
		"../bad-path":                          siteURL,
		"/index.html":                          siteURL + "/index.html",
		"//evil.com":                           siteURL,
		"https://xxx.yyy/mm":                   siteURL,
		"https://xxx.yyy/mm//double-concat":    siteURL + "//double-concat",
		"https://xxx.yyy/other-path/":          siteURL,
		"https://xxx.yyy/mm/some-path":         siteURL + "/some-path",
		"https://yyy.zzz/mm/some-path":         siteURL,
		"https://xxx.yyy/mm/some-path?foo=bar": siteURL + "/some-path?foo=bar",
		"https://xxx.yyy/mm/some-path#section": siteURL + "/some-path#section",
		"https://xxx.yyy/mm/../malicious-path": siteURL,
		":foo":                                 siteURL,
		"mmauth://callback":                    "mmauth://callback",
		"mmauth://xxx.yyy/mm":                  siteURL, // invalid mobile URL (wrong host)
	} {
		t.Run(target, func(t *testing.T) {
			require.Equal(t, expected, fullyQualifiedRedirectURL(siteURL, target, []string{"mmauth://"}))
		})
	}
}
