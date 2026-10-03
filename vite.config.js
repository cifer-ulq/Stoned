import { defineConfig } from 'vite';
import { resolve } from 'path';

const subApps = ['landing', 'main', 'jobseeker', 'login', 'admin', 'company', 'supervisors'];

export default defineConfig({
  appType: 'mpa',
  plugins: [
    {
      name: 'redirect-sub-apps',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const path = req.url.split('?')[0];
          if (subApps.includes(path.replace(/^\//, ''))) {
            res.writeHead(301, { Location: path + '/' });
            res.end();
            return;
          }
          next();
        });
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        root: resolve(__dirname, 'index.html'),
        landing: resolve(__dirname, 'landing/index.html'),
        main: resolve(__dirname, 'main/index.html'),
        jobseeker: resolve(__dirname, 'jobseeker/index.html'),
        login: resolve(__dirname, 'login/index.html'),
        onboarding: resolve(__dirname, 'login/onboarding.html'),
        admin: resolve(__dirname, 'admin/index.html'),
        company: resolve(__dirname, 'company/index.html'),
        companyStudentProfile: resolve(__dirname, 'company/student-profile.html'),
        supervisors: resolve(__dirname, 'supervisors/index.html'),
      },
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
