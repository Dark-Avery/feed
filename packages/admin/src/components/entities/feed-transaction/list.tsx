import { DateField, DeleteButton, List, Space, Table, TextField, useTable } from '@pankod/refine-antd';
import type { CrudFilter, IResourceComponentsProps } from '@pankod/refine-core';
import { useList } from '@pankod/refine-core';
import { renderText } from '@feed/ui/src/table';
import { useCallback, useMemo, useState } from 'react';
import { Button, DatePicker, Form, Input } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';

import { apiDateFormat, dayjsExtended, formDateFormat } from '/shared/lib';

import { saveXLSX } from '~/shared/lib/saveXLSX';
import type { FeedTransactionEntity, KitchenEntity, VolEntity } from '~/interfaces';
import { NEW_API_URL } from '~/const';

const ExcelJS = require('exceljs');

const { RangePicker } = DatePicker;

const mealTimeById = {
    breakfast: 'Завтрак',
    lunch: 'Обед',
    dinner: 'Ужин',
    night: 'Дожор'
};

export const FeedTransactionList: FC<IResourceComponentsProps> = () => {
    const [dateRange, setDateRange] = useState<Array<string> | null>(null);
    const [searchText, setSearchText] = useState<string>('');
    const [filters, setFilters] = useState<Array<CrudFilter> | null>(null);
    const { searchFormProps, tableProps } = useTable<FeedTransactionEntity>({
        onSearch: (values) => {
            const filters = [];
            if (searchText) {
                filters.push({
                    field: 'search',
                    value: values.search
                });
            }
            if (dateRange) {
                filters.push(
                    {
                        field: 'dtime_from',
                        value: dateRange[0]
                    },
                    {
                        field: 'dtime_to',
                        value: dateRange[1]
                    }
                );
            }
            setFilters(filters);
            return filters;
        }
    });

    const { data: vols } = useList<VolEntity>({
        resource: 'volunteers'
    });
    const { data: kitchens } = useList<KitchenEntity>({
        resource: 'kitchens'
    });

    const volNameById = useMemo(() => {
        return (vols ? vols.data : []).reduce(
            (acc, vol) => ({
                ...acc,
                [vol.id]: vol.nickname
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
            filters.map((filter, i) => {
                url = url.concat(`&${filter.field}=${filter.value}`);
            });
        }

        const { data } = await axios.get(url);
        const transactions = data.results as Array<FeedTransactionEntity>;
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Transactions log');

        const header = ['Время', 'Волонтер', 'Бейдж', 'Веган', 'Прием пищи', 'Кухня', 'Кол-во', 'Причина'];
        sheet.addRow(header);

        transactions.forEach((tx) => {
            sheet.addRow([
                tx.dtime,
                tx.volunteer ? volNameById[tx.volunteer] : 'Аноним',
                tx.qr_code,
                tx.is_vegan ? 'Да' : 'Нет',
                tx.meal_time,
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

    const handleDateRangeChange = useCallback((range: Array<dayjsExtended.Dayjs> | null) => {
        if (!range) return;
        setDateRange([
            dayjsExtended(dayjsExtended(range[0])).format(apiDateFormat),
            dayjsExtended(dayjsExtended(range[1])).format(apiDateFormat)
        ]);
    }, []);

    const Footer = (): JSX.Element => {
        return (
            <Button
                type={'primary'}
                onClick={handleClickDownload}
                icon={<DownloadOutlined />}
                disabled={!tableProps.dataSource}
            >
                Выгрузить
            </Button>
        );
    };

    return (
        <List>
            <Form {...searchFormProps}>
                <Space align={'start'}>
                    <Form.Item name='search'>
                        <Input
                            value={searchText}
                            placeholder='Имя волонтера, код бэйджа'
                            allowClear
                            onChange={(value) => setSearchText(value)}
                        />
                    </Form.Item>
                    <Form.Item name='date'>
                        <RangePicker format={formDateFormat} onChange={(range) => handleDateRangeChange(range)} />
                    </Form.Item>

                    <Button onClick={searchFormProps.form?.submit}>Применить</Button>
                </Space>
            </Form>
            <Table {...tableProps} rowKey='ulid' footer={Footer}>
                <Table.Column
                    dataIndex='dtime'
                    key='dtime'
                    title='Время'
                    render={(value) => value && <DateField format='DD/MM/YY HH:mm:ss' value={value} />}
                />
                <Table.Column
                    dataIndex='volunteer'
                    title='Волонтер'
                    render={(value) => <TextField value={value ? volNameById[value] : 'Аноним'} />}
                />
                <Table.Column dataIndex='qr_code' title='Бейдж' render={(value) => <TextField value={value ?? ''} />} />
                <Table.Column
                    dataIndex='is_vegan'
                    title='Веган'
                    render={(value) => <TextField value={value ? 'Да' : 'Нет'} />}
                />
                <Table.Column
                    dataIndex='meal_time'
                    key='meal_time'
                    title='Прием пищи'
                    render={(value) => <TextField value={mealTimeById[value]} />}
                />
                <Table.Column
                    dataIndex='kitchen'
                    key='kitchen'
                    title='Кухня'
                    render={(value) => <TextField value={kitchenNameById[value]} />}
                />
                <Table.Column dataIndex='amount' key='amount' title='Кол-во' render={renderText} />
                <Table.Column dataIndex='reason' key='reason' title='Причина' render={renderText} />
                <Table.Column<FeedTransactionEntity>
                    title='Actions'
                    dataIndex='actions'
                    render={(_, record) => (
                        <Space>
                            {/* <EditButton hideText size='small' recordItemId={record.id} /> */}
                            <DeleteButton hideText size='small' recordItemId={record.ulid} />
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
};
