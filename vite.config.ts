import { defineConfig } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';

export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
  plugins: [
    tanstackStart(),
    // react plugin HARUS setelah tanstackStart()
    viteReact(),
    nitro({
      routeRules: {
        // proxy /api/* → ayesh-core REST (berlaku di prod; dev pakai server.proxy di atas)
        '/api/**': {
          proxy: 'http://127.0.0.1:8080/**',
        },
      },
    }),
  ],
});
