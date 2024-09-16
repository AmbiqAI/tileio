import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


export default defineConfig(() => {
  const APP_BASE_URL = process.env.APP_BASE_URL || '/';
  console.log('APP_BASE_URL', APP_BASE_URL);
  return {
    base: APP_BASE_URL,
    build: {
      outDir: 'build',
    },
    plugins: [],
    // plugins: [react()],
  };
});
