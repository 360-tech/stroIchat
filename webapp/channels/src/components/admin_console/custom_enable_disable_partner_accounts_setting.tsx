// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import ConfirmModal from 'components/confirm_modal';

import BooleanSetting from './boolean_setting';

type Props = {
    id: string;
    value: boolean;
    onChange: (id: string, value: boolean, confirm?: boolean, doSubmit?: boolean, warning?: React.ReactNode | string) => void;
    cancelSubmit: () => void;
    disabled?: boolean;
    setByEnv: boolean;
    showConfirm: boolean;
}

const CustomEnableDisablePartnerAccountsSetting = ({
    id,
    value,
    onChange,
    cancelSubmit,
    disabled,
    setByEnv,
    showConfirm,
}: Props) => {
    const handleChange = useCallback((targetId: string, newValue: boolean, submit = false) => {
        const confirmNeeded = newValue === false; // Requires confirmation if disabling partner accounts
        let warning: React.ReactNode | string = '';
        if (confirmNeeded) {
            warning = (
                <FormattedMessage
                    id='admin.partner_access.disableConfirmWarning'
                    defaultMessage='All current partner account sessions will be revoked, and marked as inactive'
                />
            );
        }
        onChange(targetId, newValue, confirmNeeded, submit, warning);
    }, [onChange]);

    const handleConfirm = useCallback(() => {
        handleChange(id, false, true);
    }, [handleChange, id]);

    const label = (
        <FormattedMessage
            id='admin.partner_access.enableTitle'
            defaultMessage='Enable Partner Access: '
        />
    );

    const helpText = (
        <FormattedMessage
            id='admin.partner_access.helpText'
            defaultMessage='When true, external partner can be invited to channels within teams. Please see <a>Permissions Schemes</a> for which roles can invite partners.'
            values={{
                a: (chunks) => <Link to='/admin_console/user_management/permissions/system_scheme'>{chunks}</Link>,
            }}
        />
    );

    return (
        <>
            <BooleanSetting
                id={id}
                value={value}
                label={label}
                helpText={helpText}
                setByEnv={setByEnv}
                onChange={handleChange}
                disabled={disabled}
            />
            <ConfirmModal
                show={showConfirm && (value === false)}
                title={
                    <FormattedMessage
                        id='admin.partner_access.disableConfirmTitle'
                        defaultMessage='Save and Disable Partner Access?'
                    />
                }
                message={
                    <FormattedMessage
                        id='admin.partner_access.disableConfirmMessage'
                        defaultMessage='Disabling partner access will revoke all current Partner Account sessions. Partners will no longer be able to login and new partners cannot be invited into Mattermost. Partner users will be marked as inactive in user lists. Enabling this feature will not reinstate previous partner accounts. Are you sure you wish to remove these users?'
                    />
                }
                confirmButtonText={
                    <FormattedMessage
                        id='admin.partner_access.disableConfirmButton'
                        defaultMessage='Save and Disable Partner Access'
                    />
                }
                onConfirm={handleConfirm}
                onCancel={cancelSubmit}
            />
        </>
    );
};

export default CustomEnableDisablePartnerAccountsSetting;
