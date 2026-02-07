import { defineConfig, createLogger } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron/simple';
import path from 'node:path';

const logger = createLogger();
const originalWarning = logger.warn;

logger.warn = (msg, options) => {
  if (msg.includes('Could not read source map')) return;
  originalWarning(msg, options);
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isElectron = mode === 'electron' || process.env.VITE_ELECTRON === 'true';

  return {
    plugins: [
      react(),
      ...(isElectron
        ? [
            electron({
              main: {
                entry: 'electron/main.ts',
                vite: {
                  build: {
                    outDir: 'dist-electron',
                    rollupOptions: {
                      external: ['electron'],
                    },
                  },
                },
              },
              preload: {
                input: path.join(__dirname, 'electron/preload.ts'),
                vite: {
                  build: {
                    outDir: 'dist-electron',
                  },
                },
              },
              renderer: {},
            }),
          ]
        : []),
    ],
    customLogger: logger,
    base: isElectron ? './' : '/',
  };
});
