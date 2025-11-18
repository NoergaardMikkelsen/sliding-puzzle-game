// Entry point: mounts the Vue app to the #app element
import { createApp } from 'vue';
import App from './App.vue';
import './assets/global.css';
import { inject } from '@vercel/analytics';
import router from './router';

// Entry point: mounts the Vue app to the #app element
const app = createApp(App);
app.use(router);
app.mount('#app'); 
inject();