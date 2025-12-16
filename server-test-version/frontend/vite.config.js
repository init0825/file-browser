/**
 * Vite构建配置
 */
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    // 配置代理，解决开发环境下的跨域问题
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin:  true
      },
      '/static': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});