import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        math: 'always', //配置 math 参数实现自动计算（替代 calc()）
        additionalData: `
          @import "${path.resolve(__dirname, 'src/styles/variate.less')}";
          @import "${path.resolve(__dirname, 'src/styles/global.less')}";
        `, //导入全局变量文件 支持多文件导入（用分号分隔）
        modifyVars: {
          // 覆盖默认变量（优先级高于文件导入）
          'primary-color': '#1890FF'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});