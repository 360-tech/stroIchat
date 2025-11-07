// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export type UseOpenPricingModalReturn = {
    openPricingModal: () => void;
    isAirGapped: boolean;
}

export default function useOpenPricingModal(): UseOpenPricingModalReturn {
    // TODO: удалить хук после выпиливания его из всех компонентов
    return {
        openPricingModal: () => {},
        isAirGapped: false,
    };
}
