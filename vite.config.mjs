import { defineConfig } from 'vite';

// Development preview only. GitHub Pages serves the original static files.
export default defineConfig({
  server: {
    host: '0.0.0.0',
    allowedHosts: ['terminal.local'],
  },
});
