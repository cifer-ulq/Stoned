import { defineConfig } from 'vite';
import { resolve } from 'path';

const subApps = ['landing', 'main', 'jobseeker', 'login', 'admin', 'company', 'supervisors'];

export default defineConfig({
  appType: 'mpa',
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'shared'),
    },
  },
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
      transform(code, id) {
        if (!id.includes('node_modules') && (id.endsWith('.js') || id.endsWith('.html'))) {
          return code
            .replace(/http:\/\/localhost:8000/g, '')
            .replace(/http:\/\/127\.0\.0\.1:8000/g, '');
        }
      },
      transformIndexHtml(html) {
        const runtimeShim = `<script>
(function() {
  const origFetch = window.fetch;
  window.fetch = async function(input, init) {
    if (typeof input === 'string') {
      input = input.replace(/^https?:\\/\\/(localhost|127\\.0\\.0\\.1):8000/, '');
    }
    const res = await origFetch.call(this, input, init);
    const origJson = res.json.bind(res);
    res.json = async function() {
      const data = await origJson();
      try {
        const text = JSON.stringify(data)
          .replace(/https?:\\/\\/(localhost|127\\.0\\.0\\.1):8000\\//g, '/');
        return JSON.parse(text);
      } catch {
        return data;
      }
    };
    return res;
  };
})();
</script>`;
        return html.replace('<head>', '<head>' + runtimeShim);
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
        adminLogin: resolve(__dirname, 'login/admin-login.html'),
        setPassword: resolve(__dirname, 'login/set-password.html'),
        resetPassword: resolve(__dirname, 'login/reset-password.html'),
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
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/storage': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
});

