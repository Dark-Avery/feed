import { Tabs } from 'antd';
import { useMemo, useState, useEffect } from 'react';

import { useScreen } from 'shared/providers';
import { CommonEdit } from './common-edit/common-edit';
import CommonFood from './common-food/common-food';
import { CommonHistory } from './common-history/common-history';

const CreateEdit = () => {
    const [activeKey, setActiveKey] = useState('1');

    const { isDesktop } = useScreen();

    useEffect(() => {
        document.querySelector('.ant-page-header-heading-extra')?.remove();
    }, []);

    const items = useMemo(
        () => [
            {
                key: '1',
                label: isDesktop ? 'Основное' : 'Инфо',
                children: <CommonEdit />
            },
            {
                key: '2',
                label: 'Питание',
                children: <CommonFood />
            },
            {
                key: '3',
                label: 'История действий',
                children: <CommonHistory role="volunteer" />
            },
            {
                key: '4',
                label: 'История волонтёра',
                children: <CommonHistory role="actor" />
            }
        ],
        [isDesktop]
    );

    return (
        <Tabs
            activeKey={activeKey}
            onChange={setActiveKey}
            size={isDesktop ? 'middle' : 'small'}
            tabBarGutter={isDesktop ? 16 : 6}
            items={items}
        />
    );
};

export default CreateEdit;
