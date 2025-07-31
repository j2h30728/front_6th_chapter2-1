/* eslint-disable no-undef */
import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';

const base = process.env.NODE_ENV === 'production' ? '/front_6th_chapter2-1/' : '';

const entryFileName = 'index.advanced.html';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base,
  plugins: [
    react(),
    {
      name: 'rename-html-output',
      closeBundle() {
        const from = path.resolve(__dirname, `dist/${entryFileName}`);
        const to = path.resolve(__dirname, 'dist/index.html');
        if (fs.existsSync(from)) fs.renameSync(from, to);
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src/advanced', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, entryFileName),
        404: path.resolve(__dirname, '404.html'),
      },
    },
  },
});
