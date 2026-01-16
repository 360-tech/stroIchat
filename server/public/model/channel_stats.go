// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package model

type ChannelStats struct {
	ChannelId       string `json:"channel_id"`
	MemberCount     int64  `json:"member_count"`
	PartnerCount      int64  `json:"partner_count"`
	PinnedPostCount int64  `json:"pinnedpost_count"`
	FilesCount      int64  `json:"files_count"`
}

func (o *ChannelStats) MemberCount_() float64 {
	return float64(o.MemberCount)
}

func (o *ChannelStats) PartnerCount_() float64 {
	return float64(o.PartnerCount)
}

func (o *ChannelStats) PinnedPostCount_() float64 {
	return float64(o.PinnedPostCount)
}
