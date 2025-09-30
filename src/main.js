// Entry point: mounts the Vue app to the #app element
import { createApp } from 'vue';
import App from './App.vue';
import './assets/global.css';
import { inject } from '@vercel/analytics' 

// Entry point: mounts the Vue app to the #app element
createApp(App).mount('#app'); 
inject();