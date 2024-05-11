import React, { memo } from 'react';
import dayjs from 'dayjs';

import { Text } from '~/shared/ui/typography';
import type { TransactionJoined } from '~/db';
import { Cell, HeadCell, Row, Table, TBody, Thead } from '~/shared/ui/table/table';

import css from './history-table.module.css';

interface HistoryListProps {
    transactions: Array<TransactionJoined>;
}
export const HistoryTable = memo(function HistoryTable({ transactions }: HistoryListProps) {
    return (
        <div className={css.historyTable}>
            <Text>
                <span className={css.meat}>🥩 Мясоеды</span> / <span className={css.vegan}>🥦 Веганы</span>
            </Text>
            <Table className={css.table}>
                <Thead>
                    <Row>
                        <HeadCell scope='col'>Волонтер</HeadCell>
                        <HeadCell scope='col'>Тип</HeadCell>
                        <HeadCell scope='col'>Время</HeadCell>
                    </Row>
                </Thead>
                <TBody>
                    {transactions.map((transaction, index) => (
                        <Row key={index}>
                            <Cell>{transaction.vol ? transaction.vol.name : 'Аноним'}</Cell>
                            <Cell>{transaction.is_vegan ? '🥦' : '🥩'}</Cell>
                            <Cell>{dayjs.unix(transaction.ts).format('mm:ss').toString()}</Cell>
                        </Row>
                    ))}
                </TBody>
            </Table>
        </div>
    );
});
