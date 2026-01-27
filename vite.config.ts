import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY)
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
