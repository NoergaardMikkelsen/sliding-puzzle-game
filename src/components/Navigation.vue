<template>
  <!-- Simple navigation bar component -->
  <nav class="app-navigation">
    <!-- Logo image - uses the Schneider Electric PNG logo from the public images folder -->
    <img src="/images/SE-logo-Life-is-On-png.png" alt="Schneider Electric Logo" class="logo" />
  </nav>
</template>

<script setup>
// No script logic needed for this simple component yet
</script>

<style scoped>
/* Styles for the navigation bar */
.app-navigation { /* White background for navigation *//* Adds some vertical padding */
  display: flex;
  width: 100%;
  justify-content: center; /* Centers the logo horizontally */
  align-items: center; /* Centers the logo vertically if nav has a set height */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

/* Styles for the logo image */
.logo {/* Example height, adjust as needed */
  width: auto;
max-width: 14rem; /* Maintain aspect ratio */
}
</style> 