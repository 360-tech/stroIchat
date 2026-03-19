import React, {useEffect, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useSelector} from 'react-redux';
import type {RouteComponentProps} from 'react-router-dom';

import {GenericModal} from '@mattermost/components';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {applyCategoryShareLink, getCategoryShareLinkPreview} from 'utils/category_share_api';

type RouteParams = {
    token: string;
};

const CategoryShareApply = ({match, history}: RouteComponentProps<RouteParams>) => {
    const {formatMessage} = useIntl();
    const currentUserId = useSelector(getCurrentUserId);
    const [isOpen, setIsOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isApplying, setIsApplying] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [preview, setPreview] = useState<{categoryName: string; channelIds: string[]} | null>(null);

    useEffect(() => {
        const loadPreview = async () => {
            if (!currentUserId) {
                return;
            }

            try {
                const data = await getCategoryShareLinkPreview(currentUserId, match.params.token);
                setPreview({categoryName: data.categoryName, channelIds: data.channelIds});
            } catch (error) {
                setErrorMessage((error as Error).message || formatMessage({
                    id: 'category_share_apply.previewError',
                    defaultMessage: 'Failed to load shared category.',
                }));
            } finally {
                setIsLoading(false);
            }
        };

        loadPreview();
    }, [currentUserId, formatMessage, match.params.token]);

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleExited = () => {
        history.push('/');
    };

    const handleApply = async () => {
        if (!currentUserId) {
            return;
        }

        setIsApplying(true);
        setErrorMessage('');

        try {
            await applyCategoryShareLink(currentUserId, match.params.token);
            handleClose();
        } catch (error) {
            setErrorMessage((error as Error).message || formatMessage({
                id: 'category_share_apply.applyError',
                defaultMessage: 'Failed to apply shared category.',
            }));
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <GenericModal
            id='categoryShareApplyModal'
            compassDesign={true}
            show={isOpen}
            onHide={handleClose}
            onExited={handleExited}
            handleCancel={handleClose}
            handleConfirm={isLoading ? undefined : handleApply}
            isConfirmDisabled={isApplying || !preview || isLoading}
            confirmButtonText={formatMessage({
                id: 'category_share_apply.joinButton',
                defaultMessage: 'Join channels and create category',
            })}
            cancelButtonText={formatMessage({id: 'generic_modal.cancel', defaultMessage: 'Cancel'})}
            modalHeaderText={
                <FormattedMessage
                    id='category_share_apply.title'
                    defaultMessage='Shared Category'
                />
            }
            autoCloseOnConfirmButton={false}
        >
            {isLoading && (
                <p>
                    <FormattedMessage
                        id='category_share_apply.loading'
                        defaultMessage='Loading shared category...'
                    />
                </p>
            )}

            {!isLoading && preview && (
                <p>
                    <FormattedMessage
                        id='category_share_apply.description'
                        defaultMessage='Category: {categoryName}. Channels: {count}.'
                        values={{categoryName: preview.categoryName, count: preview.channelIds.length}}
                    />
                </p>
            )}

            {Boolean(errorMessage) && (
                <p className='color--error'>{errorMessage}</p>
            )}
        </GenericModal>
    );
};

export default CategoryShareApply;
