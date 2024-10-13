import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/secureways/', // Add this line to set the base URL for GitHub Pages
  plugins: [react()],
});
