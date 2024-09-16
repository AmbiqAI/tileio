import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const APP_BASE_URL = process.env.ASSET_URL || '/';

export default defineConfig(() => {
  return {
    base: APP_BASE_URL,
    build: {
      outDir: 'build',
    },
    plugins: [],
    // plugins: [react()],
  };
});
