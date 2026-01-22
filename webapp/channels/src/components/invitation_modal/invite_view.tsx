// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React, {useEffect, useMemo, useState} from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage, defineMessages, useIntl} from 'react-intl';

import type {Channel} from '@mattermost/types/channels';
import type {Team} from '@mattermost/types/teams';
import type {UserProfile} from '@mattermost/types/users';

import type {ActionResult} from 'mattermost-redux/types/actions';
import deepFreeze from 'mattermost-redux/utils/deep_freeze';

import useCopyText from 'components/common/hooks/useCopyText';
import ConfirmModal from 'components/confirm_modal';
import UsersEmailsInput from 'components/widgets/inputs/users_emails_input';

import {Constants, PartnerSubtype} from 'utils/constants';
import {getSiteURL} from 'utils/url';

import AddToChannels, {defaultCustomMessage, defaultInviteChannels} from './add_to_channels';
import type {CustomMessageProps, InviteChannels} from './add_to_channels';
import InviteAs, {InviteType} from './invite_as';
import OverageUsersBannerNotice from './overage_users_banner_notice';
import PartnerSubtypeSelector from './partner_subtype_selector';

import './invite_view.scss';

export const initializeInviteState = (initialSearchValue = '', inviteAsPartner = false): InviteState => {
    return deepFreeze({
        inviteType: inviteAsPartner ? InviteType.PARTNER : InviteType.MEMBER,
        customMessage: defaultCustomMessage,
        inviteChannels: defaultInviteChannels,
        usersEmails: [],
        usersEmailsSearch: initialSearchValue,
        partnerSubtype: PartnerSubtype.NOT_SPECIFIED,
    });
};

export type InviteState = {
    customMessage: CustomMessageProps;
    inviteType: InviteType;
    inviteChannels: InviteChannels;
    usersEmails: Array<UserProfile | string>;
    usersEmailsSearch: string;
    partnerSubtype: string;
};

export type Props = InviteState & {
    setInviteAs: (inviteType: InviteType) => void;
    invite: () => void;
    onChannelsChange: (channels: Channel[]) => void;
    onChannelsInputChange: (channelsInputValue: string) => void;
    onClose: () => void;
    currentTeam: Team;
    currentChannel?: Channel;
    setCustomMessage: (message: string) => void;
    toggleCustomMessage: () => void;
    channelsLoader: (value: string, callback?: (channels: Channel[]) => void) => Promise<Channel[]>;
    regenerateTeamInviteId: (teamId: string) => void;
    isAdmin: boolean;
    usersLoader: (value: string, callback: (users: UserProfile[]) => void) => Promise<UserProfile[]> | undefined;
    onChangeUsersEmails: (usersEmails: Array<UserProfile | string>) => void;
    emailInvitationsEnabled: boolean;
    onUsersInputChange: (usersEmailsSearch: string) => void;
    headerClass: string;
    footerClass: string;
    canInvitePartners: boolean;
    canAddUsers: boolean;
    townSquareDisplayName: string;
    channelToInvite?: Channel;
    onPaste?: (e: ClipboardEvent) => void;
    setPartnerSubtype: (subtype: string) => void;
    generatePartnerInviteLink?: (teamId: string, channels: string[], partnerSubtype: string) => Promise<ActionResult<{invite_url: string}>>;
}

export default function InviteView(props: Props) {
    useEffect(() => {
        if (!props.currentTeam.invite_id) {
            props.regenerateTeamInviteId(props.currentTeam.id);
        }
    }, [props.currentTeam.id, props.currentTeam.invite_id, props.regenerateTeamInviteId]);

    const {formatMessage} = useIntl();
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [partnerInviteUrl, setPartnerInviteUrl] = useState<string | null>(null);
    const [isGeneratingLink, setIsGeneratingLink] = useState(false);
    const [partnerLinkCopied, setPartnerLinkCopied] = useState(false);

    const inviteURL = useMemo(() => {
        if (props.inviteType === InviteType.MEMBER) {
            return `${getSiteURL()}/signup_user_complete/?id=${props.currentTeam.invite_id}`;
        }
        return partnerInviteUrl || '';
    }, [props.currentTeam.invite_id, props.inviteType, partnerInviteUrl]);

    const copyText = useCopyText({
        text: inviteURL,
    });

    const handleCopyLinkClick = () => {
        if (props.inviteType === InviteType.PARTNER) {
            // Always show confirm modal for partners
            setShowConfirmModal(true);
        } else {
            // For members, copy immediately
            copyText.onClick();
        }
    };

    const handleConfirmCopy = async () => {
        setShowConfirmModal(false);
        if (!props.generatePartnerInviteLink) {
            return;
        }

        setIsGeneratingLink(true);
        setPartnerLinkCopied(false);
        try {
            const result = await props.generatePartnerInviteLink(
                props.currentTeam.id,
                props.inviteChannels.channels.map((c) => c.id),
                props.partnerSubtype,
            );

            if (result.data?.invite_url) {
                setPartnerInviteUrl(result.data.invite_url);

                // Copy to clipboard directly
                try {
                    await navigator.clipboard.writeText(result.data.invite_url);
                    setPartnerLinkCopied(true);

                    // Reset copied state after timeout
                    setTimeout(() => {
                        setPartnerLinkCopied(false);
                    }, 4000);
                } catch (err) {
                    // Fallback for older browsers
                    const textField = document.createElement('textarea');
                    textField.innerText = result.data.invite_url;
                    textField.style.position = 'fixed';
                    textField.style.opacity = '0';
                    document.body.appendChild(textField);
                    textField.select();
                    try {
                        const success = document.execCommand('copy');
                        if (success) {
                            setPartnerLinkCopied(true);
                            setTimeout(() => {
                                setPartnerLinkCopied(false);
                            }, 4000);
                        }
                    } catch (fallbackErr) {
                        // Copy failed
                    }
                    textField.remove();
                }
            } else if (result.error) {
                // Handle error - could show a toast or error message
                // Error is logged by the action handler
            }
        } catch (error) {
            // Error is logged by the action handler
        } finally {
            setIsGeneratingLink(false);
        }
    };

    const handleCancelCopy = () => {
        setShowConfirmModal(false);
    };

    const canShowPartnerCopyButton = props.inviteType === InviteType.PARTNER &&
        props.inviteChannels.channels.length > 0 &&
        props.usersEmails.length > 0;

    const isCopyButtonDisabled = (props.inviteType === InviteType.PARTNER && !canShowPartnerCopyButton) || isGeneratingLink;

    const copyButton = (
        <button
            onClick={handleCopyLinkClick}
            disabled={isCopyButtonDisabled}
            data-testid='InviteView__copyInviteLink'
            aria-label={
                formatMessage({
                    id: 'invite_modal.copy_link.url_aria',
                    defaultMessage: 'team invite link {inviteURL}',
                }, {inviteURL})
            }
            className='btn btn-secondary'
            aria-live='polite'
        >
            {!copyText.copiedRecently && !partnerLinkCopied && !isGeneratingLink && (
                <>
                    <i className='icon icon-link-variant'/>
                    <FormattedMessage
                        id='invite_modal.copy_link'
                        defaultMessage='Copy invite link'
                    />
                </>
            )}
            {isGeneratingLink && (
                <>
                    <i className='icon icon-spin icon-refresh'/>
                    <FormattedMessage
                        id='invite_modal.generating_link'
                        defaultMessage='Generating link...'
                    />
                </>
            )}
            {(copyText.copiedRecently || partnerLinkCopied) && !isGeneratingLink && (
                <>
                    <i className='icon icon-check'/>
                    <FormattedMessage
                        id='invite_modal.copied'
                        defaultMessage='Copied'
                    />
                </>
            )}
        </button>
    );

    const errorProperties = {
        showError: false,
        errorMessage: messages.exceededMaxBatch,
        errorMessageValues: {
            text: Constants.MAX_ADD_MEMBERS_BATCH.toString(),
        },
    };

    if (props.usersEmails.length > Constants.MAX_ADD_MEMBERS_BATCH) {
        errorProperties.showError = true;
    }

    let placeholder;
    let noMatchMessage;
    if (props.emailInvitationsEnabled) {
        placeholder = formatMessage({
            id: 'invite_modal.add_invites',
            defaultMessage: 'Enter a name or email address',
        });
        noMatchMessage = messages.noUserFound;
    } else {
        placeholder = formatMessage({
            id: 'invitation_modal.members.search-and-add.placeholder-email-disabled',
            defaultMessage: 'Add members',
        });
        noMatchMessage = messages.noUserFoundEmailDisabled;
    }

    let validAddressMessage;
    if (props.inviteType === InviteType.MEMBER) {
        validAddressMessage = messages.validAddressMember;
    } else {
        validAddressMessage = messages.validAddressPartner;
    }

    const isInviteValid = useMemo(() => {
        if (props.inviteType === InviteType.PARTNER) {
            return props.inviteChannels.channels.length > 0 && props.usersEmails.length > 0;
        }
        return props.usersEmails.length > 0;
    }, [props.inviteType, props.inviteChannels.channels, props.usersEmails]);

    const inviteModalPeople = formatMessage({
        id: 'invite_modal.people',
        defaultMessage: 'people',
    });

    const inviteModalPartner = formatMessage({
        id: 'invite_modal.partners',
        defaultMessage: 'partners',
    });

    return (
        <>
            <Modal.Header className={props.headerClass}>
                <h1
                    id='invitation_modal_title'
                    className='modal-title'
                >
                    <FormattedMessage
                        id='invite_modal.title'
                        defaultMessage={'Invite {inviteType} to {team_name}'}
                        values={{
                            inviteType: (
                                props.inviteType === InviteType.MEMBER ? inviteModalPeople : inviteModalPartner
                            ),
                            team_name: props.currentTeam.display_name,
                        }}
                    />
                </h1>
                <button
                    id='closeIcon'
                    className='icon icon-close close'
                    aria-label='Close'
                    title='Close'
                    onClick={props.onClose}
                />
            </Modal.Header>
            <Modal.Body className='overflow-visible'>
                <div className='InviteView__sectionTitle InviteView__sectionTitle--first'>
                    <FormattedMessage
                        id='invite_modal.to'
                        defaultMessage='To:'
                    />
                </div>
                <UsersEmailsInput
                    {...errorProperties}
                    usersLoader={props.usersLoader}
                    placeholder={placeholder}
                    ariaLabel={formatMessage({
                        id: 'invitation_modal.members.search_and_add.title',
                        defaultMessage: 'Invite People',
                    })}
                    onChange={(usersEmails: Array<UserProfile | string>) => {
                        props.onChangeUsersEmails(usersEmails);
                    }}
                    value={props.usersEmails}
                    validAddressMessage={validAddressMessage}
                    noMatchMessage={noMatchMessage}
                    onInputChange={props.onUsersInputChange}
                    inputValue={props.usersEmailsSearch}
                    emailInvitationsEnabled={props.emailInvitationsEnabled}
                    autoFocus={true}
                    onPaste={props.onPaste}
                />
                {props.canInvitePartners && props.canAddUsers &&
                <InviteAs
                    inviteType={props.inviteType}
                    setInviteAs={props.setInviteAs}
                    titleClass='InviteView__sectionTitle'
                    canInvitePartners={props.canInvitePartners}
                />
                }
                {props.inviteType === InviteType.PARTNER && (
                    <PartnerSubtypeSelector
                        partnerSubtype={props.partnerSubtype}
                        setPartnerSubtype={props.setPartnerSubtype}
                        titleClass='InviteView__sectionTitle'
                    />
                )}
                {(props.inviteType === InviteType.PARTNER || (props.inviteType === InviteType.MEMBER && props.channelToInvite)) && (
                    <AddToChannels
                        setCustomMessage={props.setCustomMessage}
                        toggleCustomMessage={props.toggleCustomMessage}
                        customMessage={props.customMessage}
                        onChannelsChange={props.onChannelsChange}
                        onChannelsInputChange={props.onChannelsInputChange}
                        inviteChannels={props.inviteChannels}
                        channelsLoader={props.channelsLoader}
                        currentChannel={props.currentChannel}
                        townSquareDisplayName={props.townSquareDisplayName}
                        titleClass='InviteView__sectionTitle'
                        channelToInvite={props.channelToInvite}
                        inviteType={props.inviteType}
                    />
                )}
                <OverageUsersBannerNotice/>
            </Modal.Body>
            <Modal.Footer className={classNames('InviteView__footer', props.footerClass, {'InviteView__footer-partner': props.inviteType === InviteType.PARTNER})}>
                {(props.inviteType === InviteType.MEMBER || canShowPartnerCopyButton) && copyButton}
                <button
                    disabled={!isInviteValid}
                    onClick={props.invite}
                    className={'btn btn-primary'}
                    data-testid={'inviteButton'}
                >
                    <FormattedMessage
                        id='invite_modal.invite'
                        defaultMessage='Invite'
                    />
                </button>
            </Modal.Footer>
            <ConfirmModal
                show={showConfirmModal}
                title={
                    <FormattedMessage
                        id='invite_modal.partner_link_confirm.title'
                        defaultMessage='Generate invite link'
                    />
                }
                message={
                    <FormattedMessage
                        id='invite_modal.partner_link_confirm.message'
                        defaultMessage='When generating a new invite link, the old link will become invalid. Continue?'
                    />
                }
                confirmButtonText={
                    <FormattedMessage
                        id='invite_modal.partner_link_confirm.copy'
                        defaultMessage='Copy link'
                    />
                }
                onConfirm={handleConfirmCopy}
                onCancel={handleCancelCopy}
            />
        </>
    );
}

const messages = defineMessages({
    exceededMaxBatch: {
        id: 'invitation_modal.invite_members.exceeded_max_add_members_batch',
        defaultMessage: 'No more than **{text}** people can be invited at once',
    },
    noUserFound: {
        id: 'invitation_modal.members.users_emails_input.no_user_found_matching',
        defaultMessage: 'No one found matching **{text}**. Enter their email to invite them.',
    },
    noUserFoundEmailDisabled: {
        id: 'invitation_modal.members.users_emails_input.no_user_found_matching-email-disabled',
        defaultMessage: 'No one found matching **{text}**',
    },
    validAddressPartner: {
        id: 'invitation_modal.partners.users_emails_input.valid_email',
        defaultMessage: 'Invite **{email}** as a partner',
    },
    validAddressMember: {
        id: 'invitation_modal.members.users_emails_input.valid_email',
        defaultMessage: 'Invite **{email}** as a team member',
    },
});
