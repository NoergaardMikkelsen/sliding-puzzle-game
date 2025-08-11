import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { sri } from 'vite-plugin-sri3';

// Export Vite configuration
export default defineConfig({
  // Simple comment: add SRI integrity attributes to built JS/CSS assets
  plugins: [vue(), sri()],
}); 