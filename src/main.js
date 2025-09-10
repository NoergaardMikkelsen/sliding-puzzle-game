// Entry point: mounts the Vue app to the #app element
import { createApp } from 'vue';
import App from './App.vue';
import './assets/global.css'; // Import global styles for the whole app

// Show app when Vue is ready to prevent layout flash
createApp(App).mount('#app');
// Small delay to ensure all assets are loaded
setTimeout(() => {
  document.getElementById('app').style.opacity = '1';
}, 100); 