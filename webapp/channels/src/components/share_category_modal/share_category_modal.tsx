import React, {useMemo, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useSelector} from 'react-redux';

import {GenericModal} from '@mattermost/components';
import type {ChannelCategory} from '@mattermost/types/channel_categories';

import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import QuickInput, {MaxLengthInput} from 'components/quick_input';

import {createCategoryShareLink} from 'utils/category_share_api';

import type {GlobalState} from 'types/store';

import './share_category_modal.scss';

const MAX_CATEGORY_LENGTH = 60;
const COPY_FEEDBACK_TIMEOUT_MS = 3000;

type CopyStatus = 'idle' | 'success' | 'error';

type Props = {
    onExited: () => void;
    category: ChannelCategory;
    channelIds: string[];
};

const ShareCategoryModal = ({onExited, category, channelIds}: Props) => {
    const {formatMessage} = useIntl();
    const currentUserId = useSelector(getCurrentUserId);
    const currentTeamId = useSelector(getCurrentTeamId);
    const [categoryName, setCategoryName] = useState(category.display_name);
    const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>(channelIds);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generatedUrl, setGeneratedUrl] = useState('');
    const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');

    const channelOptions = useSelector((state: GlobalState) => {
        return channelIds.map((channelId) => {
            const channel = getChannel(state, channelId);
            return {
                id: channelId,
                name: channel?.display_name || channel?.name || channelId,
            };
        });
    });

    const sortedChannels = useMemo(() => {
        return [...channelOptions].sort((a, b) => a.name.localeCompare(b.name));
    }, [channelOptions]);

    const toggleChannel = (channelId: string) => {
        setSelectedChannelIds((prev) => {
            if (prev.includes(channelId)) {
                return prev.filter((id) => id !== channelId);
            }
            return [...prev, channelId];
        });
    };

    const isCreateDisabled = isSubmitting ||
        !categoryName.trim() ||
        selectedChannelIds.length === 0 ||
        categoryName.length > MAX_CATEGORY_LENGTH;

    const isConfirmDisabled = generatedUrl ? isSubmitting : isCreateDisabled;

    const copyToClipboard = async () => {
        if (!generatedUrl) {
            return;
        }

        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(generatedUrl);
            } else {
                const textField = document.createElement('textarea');
                textField.value = generatedUrl;
                textField.style.position = 'fixed';
                textField.style.opacity = '0';
                document.body.appendChild(textField);
                textField.select();
                const isCopied = document.execCommand('copy');
                textField.remove();
                if (!isCopied) {
                    throw new Error('copy failed');
                }
            }

            setCopyStatus('success');
            window.setTimeout(() => setCopyStatus('idle'), COPY_FEEDBACK_TIMEOUT_MS);
        } catch {
            setCopyStatus('error');
            window.setTimeout(() => setCopyStatus('idle'), COPY_FEEDBACK_TIMEOUT_MS);
        }
    };

    const handleConfirm = async () => {
        if (generatedUrl) {
            await copyToClipboard();
            return;
        }

        if (!currentTeamId || !currentUserId || isCreateDisabled) {
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const response = await createCategoryShareLink(currentUserId, {
                teamId: currentTeamId,
                categoryName: categoryName.trim(),
                channelIds: selectedChannelIds,
            });
            setGeneratedUrl(response.url);
            setCopyStatus('idle');
        } catch (error) {
            setErrorMessage((error as Error).message || formatMessage({
                id: 'share_category_modal.errorFallback',
                defaultMessage: 'Failed to create share link. Please try again.',
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <GenericModal
            id='shareCategoryModal'
            modalHeaderText={
                <FormattedMessage
                    id='share_category_modal.title'
                    defaultMessage='Share Category'
                />
            }
            confirmButtonText={generatedUrl ? formatMessage({
                id: 'share_category_modal.copyLink',
                defaultMessage: 'Copy Link',
            }) : formatMessage({
                id: 'share_category_modal.createLink',
                defaultMessage: 'Create Link',
            })}
            cancelButtonText={formatMessage({id: 'generic_modal.cancel', defaultMessage: 'Cancel'})}
            compassDesign={true}
            onExited={onExited}
            handleConfirm={handleConfirm}
            handleEnterKeyPress={handleConfirm}
            isConfirmDisabled={isConfirmDisabled}
            autoCloseOnConfirmButton={false}
        >
            <div className='ShareCategoryModal'>
                <QuickInput
                    inputComponent={MaxLengthInput}
                    autoFocus={true}
                    className='form-control filter-textbox'
                    type='text'
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    maxLength={MAX_CATEGORY_LENGTH}
                    placeholder={formatMessage({id: 'share_category_modal.categoryPlaceholder', defaultMessage: 'Category name'})}
                />

                <div className='ShareCategoryModal__channels'>
                    <div className='ShareCategoryModal__label'>
                        <FormattedMessage
                            id='share_category_modal.channelsLabel'
                            defaultMessage='Select public channels'
                        />
                    </div>
                    {sortedChannels.map((channel) => (
                        <label
                            key={channel.id}
                            className='ShareCategoryModal__channel'
                        >
                            <input
                                type='checkbox'
                                checked={selectedChannelIds.includes(channel.id)}
                                onChange={() => toggleChannel(channel.id)}
                            />
                            <span>{channel.name}</span>
                        </label>
                    ))}
                </div>

                {Boolean(errorMessage) && (
                    <div className='ShareCategoryModal__error'>
                        {errorMessage}
                    </div>
                )}

                {Boolean(generatedUrl) && (
                    <div className='ShareCategoryModal__result'>
                        <div className='ShareCategoryModal__label'>
                            <FormattedMessage
                                id='share_category_modal.generatedLink'
                                defaultMessage='Share link'
                            />
                        </div>
                        <input
                            readOnly={true}
                            className='form-control'
                            value={generatedUrl}
                        />
                        {copyStatus === 'success' && (
                            <div className='ShareCategoryModal__label'>
                                <FormattedMessage
                                    id='share_category_modal.copySuccess'
                                    defaultMessage='Link copied to clipboard'
                                />
                            </div>
                        )}
                        {copyStatus === 'error' && (
                            <div className='ShareCategoryModal__error'>
                                <FormattedMessage
                                    id='share_category_modal.copyError'
                                    defaultMessage='Failed to copy link. Please copy it manually.'
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </GenericModal>
    );
};

export default ShareCategoryModal;
