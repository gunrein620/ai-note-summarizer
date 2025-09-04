import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '.ngrok-free.app',  // 모든 ngrok-free.app 서브도메인 허용
      '.ngrok.app',       // 유료 ngrok 도메인도 허용
      '.ngrok.io'         // 구 ngrok 도메인도 허용
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        ws: true  // WebSocket 프록시도 활성화
      }
    }
  }
})