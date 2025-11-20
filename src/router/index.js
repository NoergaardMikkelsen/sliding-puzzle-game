import { createRouter, createWebHistory } from 'vue-router';
import SlidingPuzzle from '../components/SE_spil/SlidingPuzzle.vue';
import SlidingPuzzleDK from '../components/DK_spil/SlidingPuzzleDK.vue';
import CompetitionFormDK from '../components/DK_spil/CompetitionFormDK.vue';
import ThanksForParticipationDK from '../components/DK_spil/ThanksForParticipationDK.vue';

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
  },
  {
    path: '/dk_julekalender/konkurrence',
    name: 'competition-form',
    component: CompetitionFormDK
  },
  {
    path: '/dk_julekalender/tak',
    name: 'thanks',
    component: ThanksForParticipationDK
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;

