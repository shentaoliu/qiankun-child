import { useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import './style.css';

type AppProps = { container?: HTMLElement; title?: string; onMessage?: (message: string) => void };
let root: Root | null = null;
function App({ title = '独立运行的子应用', onMessage }: AppProps) {
  const [count, setCount] = useState(0);
  return <article className="child-app"><small>REACT CHILD APP</small><h2>{title}</h2>
    <p>运行模式：{qiankunWindow.__POWERED_BY_QIANKUN__ ? '基座内挂载' : '独立运行'}</p>
    <p>子应用拥有自己的 React 根节点和状态。</p>
    <button onClick={() => setCount(count + 1)}>计数：{count}</button>
    <button onClick={() => onMessage?.(`你好，基座！当前计数为 ${count}`)}>发送消息给基座</button>
  </article>;
}
function render(props: AppProps = {}) {
  const element = props.container ? props.container.querySelector('#root') : document.getElementById('root');
  if (!element) throw new Error('未找到子应用根节点');
  root = createRoot(element);
  root.render(<App {...props} />);
}
renderWithQiankun({
  bootstrap() { console.info('[react-child] bootstrap'); },
  mount(props) { render(props as AppProps); },
  unmount() { root?.unmount(); root = null; },
  update(props) { root?.render(<App {...props as AppProps} />); },
});
if (!qiankunWindow.__POWERED_BY_QIANKUN__) render();
