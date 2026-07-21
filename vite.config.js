import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        objektcontent: resolve(__dirname, 'objektcontent/index.html'),
        marke: resolve(__dirname, 'marke-und-social/index.html'),
        referenzen: resolve(__dirname, 'referenzen/index.html'),
        ueber: resolve(__dirname, 'ueber-uns/index.html'),
      },
    },
  },
});
