import type { FC } from 'react';
import cn from 'classnames';

import type { Volunteer } from '~/db';
import { Text, Title } from '~/shared/ui/typography';
import { Button } from '~/shared/ui/button';
import { VolAndUpdateInfo } from 'src/components/vol-and-update-info';
import { getPlural } from '~/shared/lib/utils';

import type { ValidatedVol, ValidationGroups } from '../post-scan-group-badge.lib';

import css from './post-scan-group-badge-misc.module.css';

const VolunteerList: FC<{
    errorVols?: Array<Volunteer>;
}> = ({ errorVols }) => (
    <div className={css.volunteerList}>
        {errorVols && errorVols.length > 0 && (
            <Text>
                <b>Без порции: </b>
                {errorVols.map((vol) => vol.name).join(', ')}
            </Text>
        )}
    </div>
);

const GroupBadgeInfo: FC<{
    name: string;
    vols: Array<Volunteer>;
    volsToFeed?: Array<Volunteer>;
}> = ({ name, vols, volsToFeed }) => {
    const totalVegs = vols.filter((vol) => vol.is_vegan).length;
    const totalMeats = vols.filter((vol) => !vol.is_vegan).length;

    const _volsToFeed = volsToFeed ?? vols;

    return (
        <div className={css.info}>
            <Title>Групповой бейдж</Title>
            <div className={css.detail}>
                <Text>
                    Вы отсканировали групповой бейдж “{name}” ({_volsToFeed.length}):
                </Text>
                <div className={cn(css.counts, { [css.oneCount]: totalVegs === 0 || totalMeats === 0 })}>
                    {totalMeats > 0 && (
                        <Text className={css.volInfo}>
                            {totalMeats} {getPlural(totalMeats, ['Мясоед', 'Мясоеда', 'Мясоедов'])} 🥩
                        </Text>
                    )}
                    {totalVegs > 0 && (
                        <Text className={css.volInfo}>
                            {totalVegs} {getPlural(totalVegs, ['Веган', 'Вегана', 'Веганов'])} 🥦
                        </Text>
                    )}
                </div>
            </div>
        </div>
    );
};

export const GroupBadgeWarningCard: FC<{
    name: string;
    validationGroups: ValidationGroups;
    doFeed: (vols: Array<ValidatedVol>) => void;
    close: () => void;
}> = ({ close, doFeed, name, validationGroups }) => {
    const { greens, reds } = validationGroups;
    const volsToFeed = [...greens];

    const handleFeed = (): void => {
        doFeed(volsToFeed);
        close();
    };

    return (
        <div className={css.groupBadgeCard}>
            <GroupBadgeInfo name={name} vols={volsToFeed} volsToFeed={volsToFeed} />
            {reds.length > 0 && <VolunteerList errorVols={reds} />}
            <BottomBlock length={volsToFeed.length} handleFeed={handleFeed} handleCancel={close} />
        </div>
    );
};

const BottomBlock: React.FC<{ handleCancel: () => void; handleFeed: () => void; length: number }> = ({
    handleCancel,
    handleFeed,
    length
}) => {
    return (
        <div className={css.bottomBLock}>
            <div className={css.buttonsBlock}>
                <Button variant='secondary' onClick={handleCancel}>
                    Отмена
                </Button>
                <Button onClick={handleFeed}>Кормить({length})</Button>
            </div>
            <VolAndUpdateInfo textColor='black' />
        </div>
    );
};
