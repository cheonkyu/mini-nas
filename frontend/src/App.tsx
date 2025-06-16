import React, { useState } from 'react';
import {
  FileOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu, theme } from 'antd';
import MainPage from './pages/MainPage';

const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
   getItem('파일 업로드', '1', <FileOutlined />, [
    getItem('Tom', '2'),
    getItem('Tom', '3'),
    getItem('Tom', '4'),
  ]),
  // getItem('파일 업로드', '1', <FileOutlined />, [
  //   getItem('Tom', '2'),
  //   getItem('Tom', '3'),
  //   getItem('Tom', '4'),
  // ]),
];

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="demo-logo-vertical" />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: '0 16px' }}>
          <MainPage />
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
};

export default App;