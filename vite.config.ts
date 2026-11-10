import { defineConfig } from 'vite';
import qiankun from 'vite-plugin-qiankun';

export default defineConfig({
  // 资源从子应用服务加载，避免嵌入后误请求基座的资源地址。
  // 这里是演示地址，生产部署需与基座 entry 一起调整。
  base: 'http://localhost:5174/',
  // 名称必须与基座 registerMicroApps 的 name 一致。
  // useDevMode 适配 Vite 开发服务中的生命周期导出和加载。
  // 当前没有启用 React Fast Refresh 插件，避免其与该插件开发模式冲突。
  plugins: [qiankun('react-child', { useDevMode: true })],
  server: {
    port: 5174,
    strictPort: true,
    // 基座 5173 与子应用 5174 不同源，允许基座获取入口及资源。
    cors: true,
    // 开发时生成的资源 URL 使用子应用服务地址。
    origin: 'http://localhost:5174',
  },
  // pnpm build 后通过 pnpm preview 做本地集成预览，同样保持端口和跨域配置。
  // 实际生产环境的 CORS 和 history 路由回退由部署服务器配置。
  preview: { port: 5174, strictPort: true, cors: true },
});
