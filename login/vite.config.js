import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared': resolve(__dirname, '../shared'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main:          resolve(__dirname, 'index.html'),
        onboarding:    resolve(__dirname, 'onboarding.html'),
        adminLogin:    resolve(__dirname, 'admin-login.html'),
        setPassword:   resolve(__dirname, 'set-password.html'),
        resetPassword: resolve(__dirname, 'reset-password.html'),
      },
    },
  },
  server: {
    port: 5174,
    open: false,
  },
});
