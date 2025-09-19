<template>
  <!-- Main app component -->
  <div class="app-container">
    <Navigation v-if="showNavigation" />
    <!-- Sliding puzzle component -->
    <SlidingPuzzle />
  </div>
</template>

<script setup>
// This is the root Vue component for the app
import Navigation from './components/Navigation.vue';
import SlidingPuzzle from './components/SlidingPuzzle.vue';

const showNavigation = false;
</script>
