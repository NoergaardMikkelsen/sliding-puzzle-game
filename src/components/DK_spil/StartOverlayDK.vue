<template>
  <!-- Start screen overlay component - DK version -->
  <div ref="startScreenOverlay" class="start-screen-overlay">
    <!-- SE Logo at top center -->
    <img src="/images/dk_julekalender/SE_logo.png" alt="Schneider Electric" class="se-logo" />
    
    <!-- Layout elements: People at bottom center, products on left and right -->
    <div class="layout-people"></div>
    <div class="layout-products-left"></div>
    <div class="layout-products-right"></div>
    
    <!-- LK® One logo text overlay -->
    <div class="lk-one-logo">LK<sup class="registered-symbol">®</sup> One</div>
    
    <!-- Snowflakes -->
    <Snowflake
      v-for="(snowflake, index) in snowflakes"
      :key="index"
      :size="snowflake.size"
      :start-position="snowflake.startPosition"
      :start-delay="snowflake.startDelay"
      :animation-duration="snowflake.duration"
    />
    
    <div class="start-screen-content">
      <!-- Hero container with image and overlaid elements -->
      <div class="hero-container">
        <!-- Puzzle preview image -->
        <picture class="start-preview-img">
          <source media="(max-width: 1024px)" srcset="/images/43598_SE_Proud_to_be_Pro_Game_01_Start_SE.webp" fetchpriority="high" />
          <img ref="previewImg" src="/images/43598_SE_Proud_to_be_Pro_Game_01_Start_SE_2psd.webp" alt="Puzzle preview" fetchpriority="high" @load="handleImageLoad" />
        </picture>
        
        <!-- Modern promo headline overlaid on image -->
        <div ref="startHeadline" class="start-headline">
          <span class="headline-line-1">Klik på dagens låge, løs puslespillet</span>
          <span class="headline-line-2">og vær med i LK<sup class="registered-symbol">®</sup> One konkurrencen</span>
        </div>
        
        <!-- Calendar container -->
        <CalendarContainer 
          :selected-day="selectedDayForAnimation" 
          :is-door-opening="isDoorOpening"
          :is-door-open="isDoorOpen"
          @door-click="handleDoorClick" 
        />
        
      </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import CalendarContainer from './CalendarContainer.vue';
import Snowflake from './Snowflake.vue';

// Defines the events that this component can emit
const emit = defineEmits(['start-game']);

// Door animation state
const selectedDayForAnimation = ref(null);
const isDoorOpening = ref(false);
const isDoorOpen = ref(false);

function handleDoorClick(dayNumber) {
  // Navigate directly to game - no delays or animations on click
  // Animations only happen on hover
  emit('start-game', dayNumber);
}

// Refs for dynamic positioning
const startScreenOverlay = ref(null);
const startLowerContainer = ref(null);
const startHeadline = ref(null);
const startBtn = ref(null);
const previewImg = ref(null);

// Generate snowflakes with different sizes and positions
const snowflakes = ref([]);
const snowflakeSizes = ['small', 'medium', 'large'];
const numberOfSnowflakes = 65; // Adjust this to control density

function generateSnowflakes() {
  const flakes = [];
  const minDistance = 2; // Minimum distance in percentage between snowflakes
  const positions = [];
  
  for (let i = 0; i < numberOfSnowflakes; i++) {
    let attempts = 0;
    let startPosition;
    let isValidPosition = false;
    
    // Try to find a position that's not too close to existing ones
    while (!isValidPosition && attempts < 50) {
      startPosition = Math.random() * 100;
      isValidPosition = positions.every(pos => Math.abs(pos - startPosition) >= minDistance);
      attempts++;
    }
    
    // If we couldn't find a good position after 50 attempts, just use the random one
    if (!isValidPosition) {
      startPosition = Math.random() * 100;
    }
    
    positions.push(startPosition);
    
    // Some snowflakes should already be visible when page loads
    // Distribute delays from -12 to 15 seconds so many are already falling
    const delay = -12 + (i / numberOfSnowflakes) * 27; // Spread from -12 to 15 seconds
    
    flakes.push({
      size: snowflakeSizes[Math.floor(Math.random() * snowflakeSizes.length)],
      startPosition: startPosition,
      startDelay: delay, // Evenly distributed delays so some are already falling
      duration: 15 // Same fall speed for all snowflakes
    });
  }
  snowflakes.value = flakes;
}

// Detect if running in iframe
function isInIframe() {
  try {
    return window !== window.top;
  } catch (e) {
    return true; // Cross-origin iframe will throw error
  }
}

// Function to calculate image size
function updateImageSize() {
  if (!previewImg.value) return;
  
  const viewportWidth = window.innerWidth;
  const useMobileImage = viewportWidth <= 1024;
  const isSmallScreen = viewportWidth <= 500; // iPhone 12 portrait ~390px
  
  // Add/remove embedded class directly on overlay element
  if (startScreenOverlay.value) {
    if (isInIframe()) {
      startScreenOverlay.value.classList.add('puzzle-embedded');
    } else {
      startScreenOverlay.value.classList.remove('puzzle-embedded');
    }
  }
  
  if (isSmallScreen) {
    // Very small screens: Use contain to show full image
    previewImg.value.style.objectFit = 'contain';
    // Do not hug the bottom on small mobiles; center the image vertically
    previewImg.value.style.objectPosition = 'center center';
  } else if (useMobileImage) {
    // 501px-1024px: Fill and bias towards bottom so logo stays visible
    previewImg.value.style.objectFit = 'cover';
    previewImg.value.style.objectPosition = 'center 95%';
  } else {
    // Desktop 1024px+: Use cover
    previewImg.value.style.objectFit = 'contain';
    previewImg.value.style.objectPosition = 'center bottom';
    previewImg.value.style.paddingBottom = '0px';
  }
}

// Function to position start-lower-container
function updateContainerPosition() {
  if (!startLowerContainer.value) return;
  
  const viewportWidth = window.innerWidth;
  
  if (viewportWidth <= 768) {
    // Mobile: Responsive positioning - smaller screen = closer to bottom
    let bottomValue;
    if (viewportWidth <= 375) {
      // iPhone SE and smaller: closer to bottom
      bottomValue = '10%';
    } else if (viewportWidth <= 500) {
      // iPhone Plus and similar: medium distance
      bottomValue = '15%';
    } else if (viewportWidth <= 540) {
      // iPhone Plus and similar: medium distance
      bottomValue = '15%';
    } else {
      // iPad and larger mobile: higher up
      bottomValue = '8rem';
    }
    startLowerContainer.value.style.bottom = bottomValue;
  } else if (viewportWidth <= 1024) {
    // Tablet
    startLowerContainer.value.style.bottom = '10rem';
  } else if (viewportWidth <= 1440) {
    // Small Desktop (MacBook Air 13")
    startLowerContainer.value.style.bottom = '5%';
  } else if (viewportWidth <= 1920) {
    // Medium Desktop (MacBook Air 15")
    startLowerContainer.value.style.bottom = '5%';
  } else {
    // Large Desktop
    startLowerContainer.value.style.bottom = '7rem';
  }
}

// Handle image load - reposition everything when image is ready
function handleImageLoad() {
  updateImageSize();
  updateContainerPosition();
  
  // Show overlay with fade-in when everything is positioned
  if (startScreenOverlay.value) {
    startScreenOverlay.value.classList.add('loaded');
  }
}

// Update all on resize
function handleResize() {
  updateImageSize();
  updateContainerPosition();
}

onMounted(async () => {
  // Wait for DOM to be fully ready
  await nextTick();
  
  // Generate snowflakes
  generateSnowflakes();
  
  // Compute initial iOS UI offset for safe area handling
  function updateSafeAreaOffset() {
    const vv = window.visualViewport;
    const viewportHeight = vv ? vv.height : window.innerHeight;
    const uiOffset = Math.max(0, window.innerHeight - viewportHeight);
    document.documentElement.style.setProperty('--ios-ui-offset', uiOffset + 'px');
  }

  updateSafeAreaOffset();
  updateImageSize();
  updateContainerPosition();
  window.addEventListener('resize', handleResize);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateSafeAreaOffset);
    window.visualViewport.addEventListener('scroll', updateSafeAreaOffset);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (window.visualViewport) {
    window.visualViewport.removeEventListener('resize', () => {});
    window.visualViewport.removeEventListener('scroll', () => {});
  }
});
</script>

<style scoped>
/* ===========================
   Base Layout & Overlay
   =========================== */
.start-screen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100svh;
  background-color: var(--black);
  background-image: url('/images/dk_julekalender/layout/SE_Julekampagne_bg_desktop_2x.webp');
  background-size: cover;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 900;
  opacity: 0; /* Hide until image is loaded */
  overflow: hidden; /* Hide snowflakes that fall outside */
}

/* Mobile background image - up to 1024px */
@media (max-width: 1024px) {
  .start-screen-overlay {
    background-image: url('/images/dk_julekalender/layout/SE_Julekampagne_bg_mobile.webp');
    background-size: cover;
    /* Use a taller height to accommodate the image better */
    height: 100svh;
    min-height: 100svh;
  }
}

/* Small mobile: Position to focus on bottom 80% of image - ensures people are visible */
@media (max-width: 600px) {
  .start-screen-overlay {
    background-position: center 80%;
  }
}

/* Fade in when content is ready */
.start-screen-overlay.loaded {
  opacity: 1;
  transition: opacity 0.01s ease-in;
}

/* Embedded: Use auto height to prevent stretching in iframe */
.start-screen-overlay.puzzle-embedded {
  height: auto !important;
}

/* Layout elements: People and products */
.layout-people {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 900px; /* Reduced from 1200px to make it smaller */
  height: auto;
  aspect-ratio: 16 / 9;
  background-image: url('/images/dk_julekalender/layout/SE_Julekampagne_elektrikere_2x.webp');
  background-size: contain;
  background-position: center bottom;
  background-repeat: no-repeat;
  z-index: 1;
  pointer-events: none;
}

/* Responsive breakpoint for people image */
@media (max-width: 1500px) and (min-width: 1025px) {
  .layout-people {
    max-width: 600px;
    width: 50%;
  }
}

.layout-products-left {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(calc(-50% - 110%)); /* Position further left, more spacing from center */
  width: 20%;
  max-width: 350px;
  height: auto;
  aspect-ratio: 1 / 1;
  background-image: url('/images/dk_julekalender/layout/products_left_2x.webp');
  background-size: contain;
  background-position: center bottom;
  background-repeat: no-repeat;
  z-index: 2;
  pointer-events: none;
}

.layout-products-right {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(calc(-50% + 110%)); /* Position further right, more spacing from center */
  width: 20%;
  max-width: 350px;
  height: auto;
  aspect-ratio: 1 / 1;
  background-image: url('/images/dk_julekalender/layout/products_right_2x.webp');
  background-size: contain;
  background-position: center bottom;
  background-repeat: no-repeat;
  z-index: 2;
  pointer-events: none;
}

/* Responsive breakpoints for products */
@media (max-width: 1200px) {
  .layout-products-left {
    transform: translateX(calc(-50% - 120%));
    width: 30%;
    max-width: 300px;
  }
  
  .layout-products-right {
    transform: translateX(calc(-50% + 120%));
    width: 30%;
    max-width: 300px;
  }
}

@media (max-width: 1024px) {
  .layout-products-left {
    transform: translateX(calc(-50% - 120%));
    width: 30%;
    max-width: 300px;
  }
  
  .layout-products-right {
    transform: translateX(calc(-50% + 120%));
    width: 30%;
    max-width: 300px;
  }
}

@media (max-width: 768px) {
  .layout-products-left {
    transform: translateX(calc(-50% - 120%));
    width: 30%;
    max-width: 250px;
  }
  
  .layout-products-right {
    transform: translateX(calc(-50% + 120%));
    width: 30%;
    max-width: 250px;
  }
}

@media (max-width: 480px) {
  .layout-products-left {
    transform: translateX(calc(-50% - 120%));
    width: 30%;
    max-width: 200px;
  }
  
  .layout-products-right {
    transform: translateX(calc(-50% + 120%));
    width: 30%;
    max-width: 200px;
  }
}

/* LK® One logo text overlay */
.lk-one-logo {
  position: absolute;
  bottom: 6%;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Arial Black', Arial, sans-serif;
  font-weight: 800;
  font-size: clamp(2rem, 5vw, 4rem);
  color: #2a9d3f; /* Slightly lighter dark green color */
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15); /* Subtle shadow for better visibility */
  z-index: 2;
  pointer-events: none;
  text-align: center;
  white-space: nowrap;
}

.lk-one-logo .registered-symbol {
  font-size: 0.4em;
  vertical-align: super;
  line-height: 0;
  position: relative;
  top: -0.3em;
}

/* Responsive adjustments for LK® One logo */
@media (max-width: 1440px) and (min-width: 1025px) {
  .lk-one-logo {
    font-size: clamp(1.8rem, 4vw, 3.5rem);
    bottom: 8%;
  }
}

@media (max-width: 1024px) {
  .lk-one-logo {
    font-size: clamp(3rem, 10vw, 4rem);
    bottom: 8%;
  }
}

@media (max-width: 768px) {
  .lk-one-logo {
    font-size: clamp(3rem, 8vw, 4rem);
    bottom: 10%;
  }
}

@media (max-width: 480px) {
  .lk-one-logo {
    font-size: clamp(2rem, 3.5vw, 3rem);
    bottom: 6%;
  }
}

/* SE Logo at top center */
.se-logo {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  max-width: 130px;
  width: auto;
  height: auto;
  pointer-events: none;
}

.start-screen-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 86svh;
  max-width: 100vw;
  overflow: visible; /* allow disclaimer to be visible at bottom */
  padding: 0;
  margin-top: 2.5rem; /* Match SlidingPuzzleDK spacing from SE logo */
  position: relative;
  z-index: 3; /* Ensure content is above layout elements and snowflakes */
}

/* Mobile and tablet: Adjust margin-top */
@media (max-width: 768px) {
  .start-screen-content {
    margin-top: 2.5rem;
  }
}

.hero-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  /* Reserve space for disclaimer on mobile/tablet and browser UI */
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + var(--ios-ui-offset, 0px));
}

/* ===========================
   Image
   =========================== */
.start-preview-img {
  display: none; /* Hidden for DK version */
}

.start-preview-img img {
  width: 100%;
  height: 100%;
  max-height: 100vh; /* Forhindrer stretching i iframe */
  object-fit: contain;
  border-radius: var(--radius);
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  display: block;
}

/* JavaScript handles image positioning dynamically */

/* ===========================
   Headline
   =========================== */
.start-headline {
  font-family: 'Arial Rounded MT Pro', Arial, Helvetica, sans-serif;
  font-weight: bold;
  position: relative;
  left: auto;
  transform: none;
  width: 80vw;
  max-width: 80vw;
  text-align: center;
  z-index: 2;
  font-size: clamp(1.5rem, 4vw, 3rem);
  margin: 0;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.headline-line-1 {
  color: var(--brand); /* Green color */
  display: block;
}

.headline-line-2 {
  color: var(--light); /* White color */
  display: block;
}

.registered-symbol {
  font-size: 0.5em;
  vertical-align: super;
  line-height: 0;
  position: relative;
  top: -0.3em;
}

.mobile-only {
  display: none;
}

/* ===========================
   Lower Container
   =========================== */
.start-lower-container {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  text-align: center;
  z-index: 2;
  bottom: clamp(3rem, 10vh, 5rem);
}

/* Desktop: Move container higher up */
@media (min-width: 769px) {
  .start-lower-container {
    bottom: clamp(3rem, 15vh, 6rem);
  }
}

/* Large desktop: Even higher */
@media (min-width: 1200px) {
  .start-lower-container {
    bottom: clamp(4rem, 20vh, 8rem);
  }
}

.start-desc {
  font-family: 'Arial Rounded MT Pro', Arial, Helvetica, sans-serif;
  font-weight: bold;
  color: var(--light);
  line-height: 1.5;
  font-size: clamp(1rem, 2.5vw, 2rem);
}

.start-desc span {
  color: var(--brand);
}

/* ===========================
   Button
   =========================== */
.start-btn {
  padding: 0.85rem 2.5rem;
  background: var(--brand);
  color: var(--light);
  border: none;
  border-radius: 0.75rem;
  font-family: 'Arial Rounded MT Pro', Arial, Helvetica, sans-serif;
  font-weight: bold;
  margin-bottom: 1rem;
  margin-top: 1rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  transition: background 0.15s, color 0.15s, transform 0.1s;
  font-size: clamp(0.9rem, 2vw, 2rem);
}
.start-btn:hover {
  background: var(--brand-dark);
  color: var(--light);
  transform: translateY(-2px) scale(1.03);
}

/* ===========================
   Disclaimer
   =========================== */
.start-disclaimer {
  position: absolute;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 0.5rem);
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  font-size: clamp(0.55rem, 1.5vw, 0.75rem);
  line-height: 1.15;
  color: rgba(255,255,255,0.75);
  text-align: center;
  max-width: 80vw;
  padding-bottom: env(safe-area-inset-bottom, 0.5rem);
  z-index: 1001; /* ensure above image and overlays */
}

/* JavaScript handles disclaimer positioning dynamically */

/* ===========================
   Responsive
   =========================== */

/* Mobile-first */
@media (max-width: 768px) {
  .mobile-only {
    display: inline;
  }

  /* Mobile: height is handled by base CSS + embedded class */
  .se-logo {
    max-width: 140px;
  }

  .start-preview-img {
    height: auto;
  }

  .hero-container {
    padding-bottom: calc(env(safe-area-inset-bottom, 0px) + var(--ios-ui-offset, 0px) + 12px);
    max-height: 90vh; /* Forhindrer at hero containeren bliver for lang på mobil */
  }

  .start-headline {
    font-size: clamp(1.2rem, 3.5vw, 1.8rem); /* Smaller font size on mobile */
    width: 90vw;
    margin-bottom: 1.5rem; /* Reduced margin */
  }

  .start-lower-container {
    bottom: clamp(2rem, 6vh, 4rem);
  }

  .start-disclaimer {
    max-width: 95vw;
    margin-top: 0.25rem;
  }
}
@media (max-width: 600px) {
  .start-disclaimer {
    font-size: 0.5rem;
  }
  .se-logo {
    max-width: 100px;
  }
}

/* Very small mobile: Fixed font size */
@media (max-width: 480px) {
  .start-headline {
    font-size: 16.5px;
  }
}

/* Tablet - Smaller tablets around 820px */
@media (min-width: 769px) and (max-width: 900px) {
  .start-headline {
    font-size: clamp(2rem, 3.5vw, 2.8rem);
    max-width: 78vw;
    margin-bottom: 2rem; /* Ensure spacing between headline and calendar */
  }
  .se-logo {
    max-width: 160px;
  }
}

/* Tablet - Larger tablets */
@media (min-width: 901px) and (max-width: 1200px) {
  .start-headline {
    font-size: clamp(2.4rem, 4vw, 4rem);
    max-width: 78vw;
    margin-bottom: 2rem; /* Ensure spacing between headline and calendar */
  }
}

/* Tablet - Common styles */
@media (min-width: 901px) and (max-width: 1200px) {
  .se-logo {
    max-width: 180px;
  }
  
  .start-desc {
    font-size: 1.4rem;
  }

  .start-btn {
    font-size: 1.2rem;
    padding: 0.7rem 2rem;
  }

  .start-lower-container {
    bottom: clamp(3rem, 8vh, 5rem);
  }
}

/* Smaller desktop (MacBook Air 13", etc.) */
@media (min-width: 1200px) and (max-width: 1600px) {
  .se-logo {
    max-width: 180px;
  }
  
  .start-headline {
    font-size: clamp(1.5rem, 3vw, 2.4rem);
    max-width: 75vw;
    margin-bottom: 1.5rem;
  }
}

/* Larger desktop screens (1920px+, etc.) */
@media (min-width: 1600px) {
  .se-logo {
    max-width: 190px;
  }
  
  .start-headline {
    font-size: clamp(1.6rem, 2.8vw, 2.6rem);
    max-width: 70vw;
    margin-bottom: 1.5rem;
  }
}

</style>

