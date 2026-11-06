import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared': resolve(__dirname, '../shared'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main:           resolve(__dirname, 'index.html'),
        studentProfile: resolve(__dirname, 'student-profile.html'),
      },
    },
  },
  server: {
    port: 5174,
    open: false,
  },
});
