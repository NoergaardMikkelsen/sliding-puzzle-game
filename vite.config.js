import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { sri } from 'vite-plugin-sri3';

// Export Vite configuration
export default defineConfig({
  plugins: [vue(), sri({
    // Only apply SRI to JS/CSS, not images
    include: ['**/*.js', '**/*.css'],
    exclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.webp', '**/*.svg', '**/*.ico']
  })],
}); 