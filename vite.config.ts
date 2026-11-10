import { defineConfig } from 'vite';
import qiankun from 'vite-plugin-qiankun';
export default defineConfig({
  base: 'http://localhost:5174/',
  plugins: [qiankun('react-child', { useDevMode: true })],
  server: { port: 5174, strictPort: true, cors: true, origin: 'http://localhost:5174' },
  preview: { port: 5174, strictPort: true, cors: true },
});
