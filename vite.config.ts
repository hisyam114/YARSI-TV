import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/YARSI-TV/',
  server: {
    proxy: {
      // Proxy 9Router API requests to avoid CORS issues
      '/api/9router': {
        target: 'http://localhost:20128',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/9router/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('9Router proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying 9Router request:', req.method, req.url);
          });
        }
      }
    }
  }
})
