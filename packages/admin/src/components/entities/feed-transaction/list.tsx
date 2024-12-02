import { DateField, DeleteButton, List, Space, Table, TextField, useTable } from '@pankod/refine-antd';
import type { CrudFilter, IResourceComponentsProps } from '@pankod/refine-core';
import { useList } from '@pankod/refine-core';
import { renderText } from '@feed/ui/src/table';
import { useCallback, useMemo, useState } from 'react';
import { Button, DatePicker, Form, Input } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import ExcelJS from 'exceljs';
import dayjs from 'dayjs';

import { dayjsExtended, formDateFormat } from '~/shared/lib';
import { saveXLSX } from '~/shared/lib/saveXLSX';
import type { FeedTransactionEntity, KitchenEntity, VolEntity } from '~/interfaces';
import { NEW_API_URL } from '~/const';

const { RangePicker } = DatePicker;

const mealTimeById = {
    breakfast: 'Завтрак',
    lunch: 'Обед',
    dinner: 'Ужин',
    night: 'Дожор'
};

export const FeedTransactionList: FC<IResourceComponentsProps> = () => {
    const [filters, setFilters] = useState<Array<CrudFilter> | null>(null);

    const { searchFormProps, tableProps } = useTable<FeedTransactionEntity>({
        onSearch: (values: any) => {
            const filters: any = [];
            if (values.search) {
                filters.push({
                    field: 'search',
                    value: values.search
                });
            }

            if (values.date) {
                filters.push(
                    {
                        field: 'dtime_from',
                        value: dayjsExtended(values.date[0]).startOf('day').toISOString()
                    },
                    {
                        field: 'dtime_to',
                        value: dayjsExtended(values.date[1]).endOf('day').toISOString()
                    }
                );
            }

            setFilters(filters);
            return filters;
        }
    });

    const { data: vols, isLoading: volsIsLoading } = useList<VolEntity>({
        resource: 'volunteers',
        config: {
            pagination: {
                pageSize: 10000
            }
        }
    });

    const { data: kitchens, isLoading: kitchensIsLoading } = useList<KitchenEntity>({
        resource: 'kitchens'
    });

    const volNameById = useMemo(() => {
        return (vols ? vols.data : []).reduce(
            (acc, vol) => ({
                ...acc,
                [vol.id]: vol.name
            }),
            {}
        );
    }, [vols]);

    const kitchenNameById = useMemo(() => {
        return (kitchens ? kitchens.data : []).reduce(
            (acc, kitchen) => ({
                ...acc,
                [kitchen.id]: kitchen.name
            }),
            {}
        );
    }, [kitchens]);

    const createAndSaveXLSX = useCallback(async (): Promise<void> => {
        let url = `${NEW_API_URL}/feed-transaction/?limit=100000`;
        if (filters) {
            filters.forEach((filter: any) => {
                if (filter.value) {
                    url = url.concat(`&${filter.field}=${filter.value}`);
                }
            });
        }

        const { data } = await axios.get(url);
        const transactions = data.results as Array<FeedTransactionEntity>;
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Transactions log');

        const header = [
            'Дата',
            'Время',
            'ID волонтера',
            'Волонтер',
            'Тип питания',
            'Прием пищи',
            'Кухня',
            'Кол-во',
            'Причина'
        ];
        sheet.addRow(header);

        transactions.forEach((tx) => {
            sheet.addRow([
                dayjs(tx.dtime).format('DD.MM.YYYY'),
                dayjs(tx.dtime).format('HH:mm:ss'),
                tx.volunteer,
                tx.volunteer ? volNameById[tx.volunteer] : 'Аноним',
                tx.is_vegan !== null ? (tx.is_vegan ? 'Веган' : 'Мясоед') : '',
                mealTimeById[tx.meal_time],
                kitchenNameById[tx.kitchen],
                tx.amount,
                tx.reason
            ]);
        });
        void saveXLSX(workbook, 'feed-transactions');
    }, [filters, kitchenNameById, volNameById]);

    const handleClickDownload = useCallback((): void => {
        void createAndSaveXLSX();
    }, [createAndSaveXLSX]);

    return (
        <List>
            <Form {...searchFormProps}>
                <Space align='start'>
                    <Form.Item name='search'>
                        <Input placeholder='Имя волонтера' allowClear />
                    </Form.Item>
                    <Form.Item name='date'>
                        <RangePicker format={formDateFormat} />
                    </Form.Item>
                    <Button type='primary' htmlType='submit'>
                        Применить
                    </Button>
                </Space>
            </Form>
            <Table
                {...tableProps}
                rowKey='ulid'
                footer={() => (
                    <Button
                        type='primary'
                        onClick={handleClickDownload}
                        icon={<DownloadOutlined />}
                        disabled={volsIsLoading || kitchensIsLoading}
                    >
                        Выгрузить
                    </Button>
                )}
            >
                <Table.Column
                    dataIndex='dtime'
                    title='Время'
                    render={(value) => <DateField format='DD/MM/YY HH:mm:ss' value={value} />}
                />
                <Table.Column
                    dataIndex='volunteer'
                    title='Волонтер'
                    render={(value) => <TextField value={volNameById?.[value] || 'Аноним'} />}
                />
                <Table.Column
                    dataIndex='volunteer'
                    title='ID волонтера'
                    render={(value) => <TextField value={value || ''} />}
                />
                <Table.Column
                    dataIndex='is_vegan'
                    title='Тип питания'
                    render={(value) => <TextField value={value !== null ? (value ? 'Веган' : 'Мясоед') : ''} />}
                />
                <Table.Column
                    dataIndex='meal_time'
                    title='Прием пищи'
                    render={(value) => <TextField value={mealTimeById[value]} />}
                />
                <Table.Column
                    dataIndex='kitchen'
                    title='Кухня'
                    render={(value) => <TextField value={kitchenNameById[value]} />}
                />
                <Table.Column dataIndex='amount' title='Кол-во' render={renderText} />
                <Table.Column dataIndex='reason' title='Причина' render={renderText} />
                <Table.Column<FeedTransactionEntity>
                    title='Действия'
                    render={(_, record) => (
                        <Space>
                            <DeleteButton hideText size='small' recordItemId={record.ulid} />
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
};
