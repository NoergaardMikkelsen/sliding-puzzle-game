<template>
  <!-- Main app component -->
  <div class="app-container">
    <Navigation v-if="showNavigation" />
    <!-- Router view for different routes -->
    <router-view />
  </div>
</template>

<script setup>
// This is the root Vue component for the app
import Navigation from './components/Navigation.vue';

const showNavigation = false;
</script>
