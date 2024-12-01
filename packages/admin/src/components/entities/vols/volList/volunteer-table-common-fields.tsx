import type { VolEntity } from '~/interfaces';

export interface VolunteerField {
    fieldName: keyof VolEntity | 'on_field';
    title: string;
    isCustom?: boolean;
}

export interface VolunteerFieldExtended {
    fieldName: string;
    title: string;
    isCustom?: boolean;
}

export const volunteerTableCommonFields: Array<VolunteerField> = [
    {
        fieldName: 'id',
        title: 'ID'
    },
    {
        fieldName: 'name',
        title: 'Позывной'
    },
    {
        fieldName: 'first_name',
        title: 'Имя'
    },
    {
        fieldName: 'last_name',
        title: 'Фамилия'
    },
    {
        fieldName: 'directions',
        title: 'Службы'
    },
    {
        fieldName: 'arrivals',
        title: 'Даты на поле'
    },
    {
        fieldName: 'on_field',
        title: 'Статус'
    },
    {
        fieldName: 'is_blocked',
        title: '🚫 Заблокирован'
    },
    {
        fieldName: 'kitchen',
        title: 'Кухня'
    },
    {
        fieldName: 'printing_batch',
        title: 'Партия Бейджа'
    },
    {
        fieldName: 'comment',
        title: 'Комментарий'
    }
];
