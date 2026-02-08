import { defineConfig, createLogger } from 'vite';
import react from '@vitejs/plugin-react';

import electron from 'vite-plugin-electron/simple';

const logger = createLogger();
const originalWarning = logger.warn;

logger.warn = (msg, options) => {
  if (msg.includes('Could not read source map')) return;
  originalWarning(msg, options);
};

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    electron({
      main: {
        entry: 'electron/main.ts',
        vite: {
          build: {
            rollupOptions: {
              external: ['bufferutil', 'utf-8-validate'],
            },
          },
        },
      },
      preload: {
        input: 'electron/preload.ts',
      },
    }),
  ],
  customLogger: logger,
});
