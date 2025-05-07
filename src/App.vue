<template>
  <!-- Main app component -->
  <div class="app-container">
    <Navigation />
    <h1>Sliding Puzzle Game</h1>
    <!-- Sliding puzzle component -->
    <SlidingPuzzle />
  </div>
</template>

<script setup>
// This is the root Vue component for the app
import Navigation from './components/Navigation.vue';
import SlidingPuzzle from './components/SlidingPuzzle.vue';
</script>
