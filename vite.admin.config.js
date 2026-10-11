import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

// Vite configuration for KnowYourLoan for Administrators (Port 3001)
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'admin-index-rewrite',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/' || req.url === '/index.html') {
            req.url = '/admin.html';
          }
          next();
        });
      },
    },
  ],
  server: {
    port: 3001,
    strictPort: true,
    open: false,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/health': 'http://127.0.0.1:8000',
      '/predict': 'http://127.0.0.1:8000',
      '/explain': 'http://127.0.0.1:8000',
    },
  },
  build: {
    rollupOptions: {
      input: {
        admin: resolve(import.meta.dirname, 'admin.html'),
      },
    },
  },
});
