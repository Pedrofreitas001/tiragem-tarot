import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file from project root directory
  const env = loadEnv(mode, process.cwd(), '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
    plugins: [react()],
    // No longer expose sensitive API keys to the client
    define: {
      'process.env.APP_VERSION': JSON.stringify('1.0.0'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      // Optimize build output
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          // Code splitting strategy
          manualChunks(id) {
            // Separate tarot data
            if (id.includes('tarotData')) {
              return 'tarot-data';
            }
            // Separate services
            if (id.includes('services')) {
              return 'services';
            }
            // Separate components
            if (id.includes('components')) {
              return 'components';
            }
          },
        },
      },
      chunkSizeWarningLimit: 600,
      // Enable incremental build
      sourcemap: false,
    },
    // Optimize dependencies
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'recharts'],
      exclude: ['tarotData'],
    },
  };
});
