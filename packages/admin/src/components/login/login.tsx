import { Button, Card, Checkbox, Col, Form, Input, Layout, Row, Typography, Segmented } from 'antd';
import { useLogin, useTranslate } from '@pankod/refine-core';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';

import { Rules } from '../form/rules';

import { containerStyles, imageContainer, layoutStyles, titleStyles } from './styles';
import logo from './logo.svg';

const { Title } = Typography;
export interface ILoginForm {
    username: string;
    password: string;
    remember: boolean;
    isQR: boolean;
}

const rowStyle = {
    height: '100vh'
};

type OptionValue = 'qr' | 'login';

export const LoginPage: FC = () => {
    const [form] = Form.useForm<ILoginForm>();
    const translate = useTranslate();
    const [selectedOption, setSelectedOption] = useState<OptionValue>('qr');


    const { isLoading, mutate: login } = useLogin<ILoginForm>();

    const CardTitle = (
        <Title level={1} style={titleStyles}>
            {/*{translate("pages.login.title", "Sign in your account")}*/}
            КУХНЯ
        </Title>
    );

    const scanner = useRef<QrScanner | null>(null);
    const video = useRef<HTMLVideoElement | null>(null);

    const loadingRef = useRef(false);

    const onScan = useCallback((qr: string) => {
        if (loadingRef.current) {
            return;
        }

        loadingRef.current = true;
        login({
            username: qr,
            password: '',
            isQR: true,
            remember: false
        });

        setTimeout(() => {
            loadingRef.current = false;
        }, 1000);
    }, []);

    useEffect(() => {
        if (selectedOption !== 'qr' || !video.current) 
            return;
        

        const s = new QrScanner(
            video.current,
            ({ data }) => {
                void onScan(data.replace(/[^A-Za-z0-9]/g, ''));
            },
            {
                onDecodeError: () => {
                    // no handle
                },
                highlightScanRegion: true,
                highlightCodeOutline: true
            }
        );

        scanner.current = s;

        void s.start();

        return () => {
            s.destroy();
        };
    }, [onScan, selectedOption]);

    const onVideoReady = (ref: HTMLVideoElement) => {
        video.current = ref;
    };

    useEffect(() => {
        // @ts-ignore
        function onHardwareScan({ detail: { scanCode } }): void {
            void onScan(scanCode.replace(/[^A-Za-z0-9]/g, ''));
        }

        // @ts-ignore
        document.addEventListener('scan', onHardwareScan);

        return (): void => {
            // @ts-ignore
            document.removeEventListener('scan', onHardwareScan);
        };
    }, [onScan]);

    const loginForm = (
        <Form<ILoginForm>
            layout='vertical'
            form={form}
            onFinish={(values) => login(values)}
            requiredMark={false}
            initialValues={{ remember: false }}
        >
            <Form.Item
                name='username'
                label={translate('pages.login.username', 'Username')}
                rules={Rules.required}
                style={{ marginBottom: '18px' }}
            >
                <Input size='large' placeholder={translate('pages.login.username', 'Username')} />
            </Form.Item>
            <Form.Item
                name='password'
                label={translate('pages.login.password', 'Password')}
                rules={Rules.required}
                style={{ marginBottom: '12px' }}
            >
                <Input type='password' placeholder='●●●●●●●●' size='large' />
            </Form.Item>
            <div style={{ marginBottom: '42px' }}>
                <Form.Item name='remember' valuePropName='checked' noStyle>
                    <Checkbox style={{ fontSize: '12px' }}>
                        {translate('pages.login.remember', 'Remember me')}
                    </Checkbox>
                </Form.Item>
            </div>
            <Button type='primary' size='large' htmlType='submit' loading={isLoading} block>
                {translate('pages.login.signin', 'Sign in')}
            </Button>
        </Form>
    );

    const qrForm = (
        <div style={{ textAlign: 'center' }}>
        <video
            ref={onVideoReady}
            style={{ width: '100%', marginBottom: '24px', borderRadius: '6px' }}
        />
    </div>
    );


    return (
        <Layout style={layoutStyles}>
            <Row justify='center' align='middle' style={rowStyle}>
                <Col xs={22}>
                    <div style={containerStyles}>
                        <div style={imageContainer}>
                            {/* @ts-ignore */}
                            <img src={logo.src} alt='feed' style={{ height: '56px' }} />
                        </div>
                        <Card title={CardTitle} headStyle={{ borderBottom: 0 }}>
                            {selectedOption === 'qr' ? qrForm : loginForm}
                            <Segmented
                                options={[
                                    {
                                        label: (
                                            <div style={{ padding: 6 }}>
                                                <div>QR-код</div>
                                            </div>
                                        ),
                                        value: 'qr'
                                    },
                                    {
                                        label: (
                                            <div style={{ padding: 6 }}>
                                                <div>Логин и пароль</div>
                                            </div>
                                        ),
                                        value: 'login'
                                    }
                                ]}
                                block
                                onChange={(value) => setSelectedOption(value as OptionValue)}
                            />
                        </Card>
                    </div>
                </Col>
            </Row>
        </Layout>
    );
};