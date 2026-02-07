import { defineConfig, createLogger } from 'vite';
import react from '@vitejs/plugin-react';

const logger = createLogger();
const originalWarning = logger.warn;

logger.warn = (msg, options) => {
  if (msg.includes('Could not read source map')) return;
  originalWarning(msg, options);
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  customLogger: logger,
  base: './', // For Electron, use relative paths
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
