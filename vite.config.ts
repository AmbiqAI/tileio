import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    base: '/tileio/',
    build: {
      outDir: 'build',
    },
    plugins: [],
    // plugins: [react()],
  };
});
