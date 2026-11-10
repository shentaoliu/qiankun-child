import { Alert, Button, Card, ConfigProvider, Descriptions, Layout, Menu, Result, Space, Statistic, Tag, Typography } from 'antd';
import { useState } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { createRoot, type Root } from 'react-dom/client';
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import './style.css';

type AppProps = { container?: HTMLElement; title?: string; onMessage?: (message: string) => void };
let root: Root | null = null;
function App({ title = '独立运行的子应用', onMessage }: AppProps) {
  const [count, setCount] = useState(0);
  const { pathname } = useLocation();
  const embedded = !!qiankunWindow.__POWERED_BY_QIANKUN__;
  return <ConfigProvider prefixCls="child-ant" theme={{ token: { colorPrimary: '#0d9488', borderRadius: 12 } }}>
    <Layout className={embedded ? 'child-shell child-shell-embedded' : 'child-shell child-shell-standalone'}>
      {!embedded && <Layout.Sider width={220} breakpoint="md" collapsedWidth={0} className="child-sidebar">
        <div className="child-brand">子应用工作台</div>
        <Menu theme="dark" mode="inline" selectedKeys={[pathname.replace(/\/$/, '') || '/']} items={[
          { key: '/', label: <Link to="/">应用首页</Link> },
          { key: '/about', label: <Link to="/about">关于应用</Link> },
        ]} />
      </Layout.Sider>}
      <Layout.Content className="child-content"><article className="child-app">
      <div className="child-heading"><div><Typography.Text type="secondary">REACT CHILD APP</Typography.Text><Typography.Title level={3}>{title}</Typography.Title></div><Tag color="cyan">{embedded ? '基座内运行' : '独立运行'}</Tag></div>
      <div className="child-page"><Routes>
        <Route path="/" element={<Alert type="success" showIcon message="欢迎进入子应用" description="试试下方计数器，再把消息发送到基座。页面切换时，计数会保留。" />} />
        <Route path="/about" element={<Descriptions title="应用信息" bordered column={1} items={[
          { key: 'stack', label: '技术栈', children: 'React · TypeScript · Vite · Ant Design' },
          { key: 'route', label: '路由前缀', children: embedded ? '/child' : '/' },
          { key: 'lifecycle', label: '生命周期', children: 'bootstrap → mount → unmount' },
        ]} />} />
        <Route path="*" element={<Result status="404" title="页面不存在" extra={<Link to="/">返回应用首页</Link>} />} />
      </Routes></div>
      <Card className="child-interaction"><div className="child-counter"><Statistic title="当前计数" value={count} /><Space wrap><Button onClick={() => setCount(value => value + 1)}>计数 +1</Button><Button type="primary" disabled={!onMessage} onClick={() => onMessage?.(`你好，基座！当前计数为 ${count}`)}>发送消息给基座</Button></Space></div>{!onMessage && <Typography.Paragraph type="secondary">独立运行模式下，可在基座中体验消息通信。</Typography.Paragraph>}</Card>
    </article></Layout.Content></Layout>
  </ConfigProvider>;
}
function RoutedApp(props: AppProps) {
  return <BrowserRouter basename={qiankunWindow.__POWERED_BY_QIANKUN__ ? '/child' : '/'}>
    <App {...props} />
  </BrowserRouter>;
}
function render(props: AppProps = {}) {
  const element = props.container ? props.container.querySelector('#root') : document.getElementById('root');
  if (!element) throw new Error('未找到子应用根节点');
  root = createRoot(element);
  root.render(<RoutedApp {...props} />);
}
renderWithQiankun({
  bootstrap() { console.info('[react-child] bootstrap'); },
  mount(props) { render(props as AppProps); },
  unmount() { root?.unmount(); root = null; },
  update(props) { root?.render(<RoutedApp {...props as AppProps} />); },
});
if (!qiankunWindow.__POWERED_BY_QIANKUN__) render();
