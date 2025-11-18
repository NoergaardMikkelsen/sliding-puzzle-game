import { createRouter, createWebHistory } from 'vue-router';
import SlidingPuzzle from '../components/SE_spil/SlidingPuzzle.vue';
import SlidingPuzzleDK from '../components/DK_spil/SlidingPuzzleDK.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: SlidingPuzzle
  },
  {
    path: '/dk_julekalender',
    name: 'dk-julekalender',
    component: SlidingPuzzleDK
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;

