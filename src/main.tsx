import {
  Alert,
  Button,
  Card,
  ConfigProvider,
  Descriptions,
  Layout,
  Menu,
  Result,
  Space,
  Statistic,
  Tag,
  Typography,
} from "antd";
import { useState } from "react";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { createRoot, type Root } from "react-dom/client";
import {
  renderWithQiankun,
  qiankunWindow,
} from "vite-plugin-qiankun/dist/helper";
import "./style.css";

// container 由 qiankun 提供；title / onMessage 是基座自定义的通信属性。
// 独立运行时没有这些属性，因此均为可选。
type AppProps = {
  container?: HTMLElement;
  title?: string;
  onMessage?: (message: string) => void;
};
// 保存本次挂载的 React 根节点，供 update 复用、unmount 销毁。
let root: Root | null = null;
function App({ title = "独立运行的子应用", onMessage }: AppProps) {
  const [count, setCount] = useState(0);
  const { pathname } = useLocation();
  // 使用插件提供的沙箱窗口读取运行标记；不要自行设置这个标记。
  // Vite ESM 接入存在 JS 沙箱限制，仍应避免直接修改全局变量。
  const embedded = !!qiankunWindow.__POWERED_BY_QIANKUN__;
  return (
    <ConfigProvider
      // 独立组件前缀减少与基座 antd 样式冲突，不代表完整的 CSS 隔离。
      prefixCls="child-ant"
      theme={{ token: { colorPrimary: "#0d9488", borderRadius: 12 } }}
    >
      <Layout
        className={
          embedded
            ? "child-shell child-shell-embedded"
            : "child-shell child-shell-standalone"
        }
      >
        {/* 嵌入模式由基座提供导航；独立运行才显示自己的侧栏。 */}
        {!embedded && (
          <Layout.Sider
            width={220}
            breakpoint="md"
            collapsedWidth={0}
            className="child-sidebar"
          >
            <div className="child-brand">子应用工作台</div>
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[pathname.replace(/\/$/, "") || "/"]}
              items={[
                { key: "/", label: <Link to="/">应用首页</Link> },
                { key: "/about", label: <Link to="/about">关于应用</Link> },
              ]}
            />
          </Layout.Sider>
        )}
        <Layout.Content className="child-content">
          <article className="child-app">
            <div className="child-heading">
              <div>
                <Typography.Text type="secondary">
                  REACT CHILD APP
                </Typography.Text>
                <Typography.Title level={3}>{title}</Typography.Title>
              </div>
              <Tag color="cyan">{embedded ? "基座内运行" : "独立运行"}</Tag>
            </div>
            <div className="child-page">
              <Routes>
                <Route
                  path="/"
                  element={
                    <Alert
                      type="success"
                      showIcon
                      message="欢迎进入子应用"
                      description="试试下方计数器，再把消息发送到基座。页面切换时，计数会保留。"
                    />
                  }
                />
                <Route
                  path="/about"
                  element={
                    <Descriptions
                      title="应用信息"
                      bordered
                      column={1}
                      items={[
                        {
                          key: "stack",
                          label: "技术栈",
                          children: "React · TypeScript · Vite · Ant Design",
                        },
                        {
                          key: "route",
                          label: "路由前缀",
                          children: embedded ? "/child" : "/",
                        },
                        {
                          key: "lifecycle",
                          label: "生命周期",
                          children: "bootstrap → mount → unmount",
                        },
                      ]}
                    />
                  }
                />
                <Route
                  path="*"
                  element={
                    <Result
                      status="404"
                      title="页面不存在"
                      extra={<Link to="/">返回应用首页</Link>}
                    />
                  }
                />
              </Routes>
            </div>
            <Card className="child-interaction">
              <div className="child-counter">
                <Statistic title="当前计数" value={count} />
                <Space wrap>
                  <Button onClick={() => setCount((value) => value + 1)}>
                    计数 +1
                  </Button>
                  <Button
                    type="primary"
                    disabled={!onMessage}
                    onClick={() =>
                      onMessage?.(`你好，基座！当前计数为 ${count}`)
                    }
                  >
                    发送消息给基座
                  </Button>
                </Space>
              </div>
              {!onMessage && (
                <Typography.Paragraph type="secondary">
                  独立运行模式下，可在基座中体验消息通信。
                </Typography.Paragraph>
              )}
            </Card>
          </article>
        </Layout.Content>
      </Layout>
    </ConfigProvider>
  );
}
// 与基座 activeRule 对齐：嵌入时 /about 对应 /child/about；独立时对应 /about。
// Link 自动补齐 basename；生产服务器需将这些路径回退到对应 index.html。
function RoutedApp(props: AppProps) {
  return (
    <BrowserRouter
      basename={qiankunWindow.__POWERED_BY_QIANKUN__ ? "/child" : "/"}
    >
      <App {...props} />
    </BrowserRouter>
  );
}
function render(props: AppProps = {}) {
  // 嵌入时仅在 qiankun 容器内部找 #root，避免选中基座同名根节点。
  // 独立运行时才从当前 document 获取根节点。
  const element = props.container
    ? props.container.querySelector("#root")
    : document.getElementById("root");
  if (!element) throw new Error("未找到子应用根节点");
  root = createRoot(element);
  root.render(<RoutedApp {...props} />);
}
// 将生命周期交给 Vite 适配插件暴露，供 qiankun 调度。
renderWithQiankun({
  // 首次加载时初始化，一般每次应用加载只执行一次。
  bootstrap() {
    console.info("[react-child] bootstrap....");
  },
  // 每次应用激活都会执行：创建 React 根节点并注入基座 props。
  mount(props) {
    console.log("mount.....");
    render(props as AppProps);
  },
  // 离开激活路径时卸载 React，触发组件 effect 清理并释放根节点引用。
  // 后续新增的全局监听、定时器或订阅也需在相应清理逻辑中释放。
  unmount() {
    console.log("unmount....");
    root?.unmount();
    root = null;
  },
  // 预留手动加载模式 loadMicroApp().update(props) 的更新入口。
  // 当前 registerMicroApps 路由模式没有主动调用这个生命周期。
  update(props) {
    root?.render(<RoutedApp {...(props as AppProps)} />);
  },
});
// 独立启动时主动渲染；嵌入时等待 mount，防止创建两次 React 根节点。
if (!qiankunWindow.__POWERED_BY_QIANKUN__) render();
