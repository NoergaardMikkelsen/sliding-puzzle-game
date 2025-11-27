<template>
  <div class="competition-form-view">
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
    
    <!-- Title -->
    <h1 class="title">Deltag i konkurrencen</h1>

    <!-- Typeform container -->
    <div class="typeform-container">
      <!-- Web Typeform -->
      <div class="typeform-web">
        <div 
            class="typeform-embed"
          data-tf-live="01KAGN31T56MKJ2NRPSYRX9PTX"
          data-tf-width="100%"
          data-tf-height="100%"
        ></div>
      </div>
      
      <!-- Mobile Typeform -->
      <div class="typeform-mobile">
        <div 
          class="typeform-embed"
          data-tf-live="01KAGN5HMP7M8TQ3JCTAW9ATRY"
          data-tf-width="100%"
          data-tf-height="100%"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Snowflake from './Snowflake.vue';

const router = useRouter();
const route = useRoute();

// Get day number from route query
const dayNumber = ref(route.query.day ? parseInt(route.query.day) : null);

// Generate snowflakes
const snowflakes = ref([]);
const snowflakeSizes = ['small', 'medium', 'large'];
const numberOfSnowflakes = 65;
const RESIZE_DEBOUNCE_MS = 200;
let resizeTimeoutId = null;

// Mark day as completed in localStorage
function markDayAsCompleted(dayNumber) {
  try {
    const stored = localStorage.getItem('dk_julekalender_completed_days');
    const completedDays = stored ? JSON.parse(stored) : [];
    if (!completedDays.includes(dayNumber)) {
      completedDays.push(dayNumber);
      localStorage.setItem('dk_julekalender_completed_days', JSON.stringify(completedDays));
    }
  } catch (e) {
    // localStorage might not be available, ignore
  }
}

const typeformMessageHandler = (event) => {
  const isTypeformSubmit =
    event?.data &&
    (event.data.type === 'form-submit' || event.data.type === 'TF_FORM_SUBMIT');

  if (isTypeformSubmit) {
    const dayNumber = route.query.day ? parseInt(route.query.day) : null;
    
    // Mark this day as completed when form is submitted
    if (dayNumber) {
      markDayAsCompleted(dayNumber);
    }
    
    router.push({
      name: 'thanks',
      query: { day: dayNumber }
    });
  }
};

function generateSnowflakes() {
  const flakes = [];
  const minDistance = 2;
  const positions = [];
  
  for (let i = 0; i < numberOfSnowflakes; i++) {
    let attempts = 0;
    let startPosition;
    let isValidPosition = false;
    
    while (!isValidPosition && attempts < 50) {
      startPosition = Math.random() * 100;
      isValidPosition = positions.every(pos => Math.abs(pos - startPosition) >= minDistance);
      attempts++;
    }
    
    if (!isValidPosition) {
      startPosition = Math.random() * 100;
    }
    
    positions.push(startPosition);
    
    const delay = -12 + (i / numberOfSnowflakes) * 27;
    
    flakes.push({
      size: snowflakeSizes[Math.floor(Math.random() * snowflakeSizes.length)],
      startPosition: startPosition,
      startDelay: delay,
      duration: 15
    });
  }
  snowflakes.value = flakes;
}

function handleResize() {
  window.clearTimeout(resizeTimeoutId);
  resizeTimeoutId = window.setTimeout(() => {
    forceTypeformHeight();
  }, RESIZE_DEBOUNCE_MS);
}

onMounted(() => {
  generateSnowflakes();
  window.addEventListener('resize', handleResize);
  handleResize();
  
  // Load Typeform script if not already loaded
  if (!window.typeformEmbed) {
    const script = document.createElement('script');
    script.src = '//embed.typeform.com/next/embed.js';
    script.async = true;
    document.body.appendChild(script);
    
    script.onload = () => {
      // Wait for Typeform to initialize, then listen for completion and force height
      setTimeout(() => {
        setupTypeformListeners();
        forceTypeformHeight();
      }, 1500);
    };
  } else {
    setupTypeformListeners();
    setTimeout(forceTypeformHeight, 500);
  }
});

function forceTypeformHeight() {
  // Force Typeform iframe to use container height
  const container = document.querySelector('.typeform-container');
  if (container) {
    const iframes = container.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      iframe.style.height = '100%';
      iframe.style.minHeight = container.offsetHeight + 'px';
    });
  }
}

function setupTypeformListeners() {
  // Listen for Typeform completion events
  window.removeEventListener('message', typeformMessageHandler);
  window.addEventListener('message', typeformMessageHandler);
}

onBeforeUnmount(() => {
  window.removeEventListener('message', typeformMessageHandler);
  window.removeEventListener('resize', handleResize);
  window.clearTimeout(resizeTimeoutId);
});

</script>

<style scoped>
.competition-form-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 2rem 1rem; /* Match SlidingPuzzleDK padding */
  text-align: center;
  color: var(--light);
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  min-height: 100svh;
  height: 100svh;
  overflow: hidden;
  background-color: var(--black);
  background-image: url('/images/dk_julekalender/layout/SE_Julekampagne_bg_desktop_2x.webp');
  background-size: cover;
  background-repeat: no-repeat;
}

/* Fallback for browsers that don't support svh */
@supports not (height: 1svh) {
  .competition-form-view {
    height: 100vh;
    min-height: 100vh;
  }
}

/* Mobile background image - up to 1024px */
@media (max-width: 1024px) {
  .competition-form-view {
    background-image: url('/images/dk_julekalender/layout/SE_Julekampagne_bg_mobile.webp');
  }
}

/* Small mobile: Position to focus on bottom 80% of image - ensures people are visible */
@media (max-width: 600px) {
  .competition-form-view {
    background-position: center 80%;
  }
}

/* SE Logo */
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

/* Layout elements: People and products */
.layout-people {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 900px;
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
  transform: translateX(calc(-50% - 110%));
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
  transform: translateX(calc(-50% + 110%));
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
  color: #2a9d3f;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
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

.title {
  font-size: clamp(1.5rem, 4vw, 3rem); /* Match StartOverlayDK sizes */
  font-weight: bold;
  color: var(--light);
  font-family: 'Arial Rounded MT Pro', Arial, sans-serif;
  position: relative;
  z-index: 3;
  margin: 0;
  margin-top: 2.5rem; /* Match SlidingPuzzleDK placement */
  margin-bottom: 0.5rem;
  text-align: center;
  width: 80vw;
  max-width: 80vw;
  padding: 0 1rem;
}

.typeform-container {
  --tf-desktop-scale: 0.9;
  position: relative;
  width: min(78vw, 520px);
  max-width: 520px;
  min-width: 320px;
  height: clamp(500px, 75vh, 860px);
  min-height: 500px;
  max-height: 860px;
  z-index: 3;
  margin: 1.25rem auto 0;
  display: flex;
  align-items: stretch;
  justify-content: center;
  transform-origin: center top;
  overflow: hidden;
}

.typeform-web,
.typeform-mobile {
  width: 100%;
  height: 100%;
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.typeform-mobile {
  display: none;
}

.typeform-embed {
  width: 100%;
  height: 100%;
  transform-origin: center top;
  display: block;
}

.typeform-web .typeform-embed {
  transform: scale(var(--tf-desktop-scale));
}

.typeform-mobile .typeform-embed {
  transform: none;
  width: 100%;
}

.typeform-container iframe,
.typeform-container [data-tf-live],
.typeform-container [data-tf-live] iframe {
  width: 100% !important;
  height: 100% !important;
  min-height: 100% !important;
  border: none;
  border-radius: 0.5rem;
  display: block;
}

/* Show mobile typeform on mobile devices */
@media (max-width: 768px) {
  .typeform-web {
    display: none;
  }
  
  .typeform-container {
    width: 95vw;
    max-width: 95vw;
    height: clamp(460px, 82vh, 760px);
    min-height: 460px;
    max-height: 820px;
    padding: 0 0.75rem;
  }
  
  .typeform-mobile {
    display: flex;
  }
}

.registered-symbol {
  font-size: 0.5em;
  vertical-align: super;
  line-height: 0;
  position: relative;
  top: -0.3em;
}

/* Responsive design */
@media (max-width: 768px) {
  .competition-form-view {
    padding: 1rem 1rem; /* Match SlidingPuzzleDK mobile padding */
  }
  
  .se-logo {
    max-width: 140px;
  }
  
  .title {
    font-size: clamp(1.2rem, 3.5vw, 1.8rem); /* Match StartOverlayDK mobile */
    margin-top: 2.5rem; /* Match SlidingPuzzleDK placement */
    width: 90vw;
    max-width: 90vw;
    padding: 0 0.5rem;
  }
}

@media (max-width: 600px) {
  .se-logo {
    max-width: 100px;
  }
  
  .typeform-container {
    height: clamp(440px, 85vh, 700px);
    min-height: 440px;
    padding: 0 0.5rem;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 20px; /* Match StartOverlayDK - larger for better readability */
    margin-top: 2.5rem; /* Match SlidingPuzzleDK placement */
    width: 95vw;
    max-width: 95vw;
    padding: 0 0.5rem;
  }
  
  .typeform-container {
    height: clamp(420px, 85vh, 660px);
    min-height: 420px;
    padding: 0 0.25rem;
  }
}

/* Tablet - Smaller tablets around 820px */
@media (min-width: 769px) and (max-width: 900px) {
  .competition-form-view {
    padding: 2rem 1rem;
  }
  
  .se-logo {
    max-width: 160px;
  }
  
  .title {
    font-size: clamp(2.2rem, 4vw, 2.8rem); /* Larger to ensure it's not smaller than mobile */
    margin-top: 2.5rem; /* Match SlidingPuzzleDK placement */
    width: 78vw;
    max-width: 78vw;
  }
}

/* Tablet - Larger tablets */
@media (min-width: 901px) and (max-width: 1200px) {
  .competition-form-view {
    padding: 2rem 1rem;
  }
  
  .se-logo {
    max-width: 180px;
  }
  
  .title {
    font-size: clamp(2.4rem, 4vw, 4rem); /* Match StartOverlayDK tablet */
    margin-top: 2.5rem; /* Match SlidingPuzzleDK placement */
    width: 78vw;
    max-width: 78vw;
  }
}

/* Smaller desktop (MacBook Air 13", etc.) */
@media (min-width: 1200px) and (max-width: 1600px) {
  .competition-form-view {
    padding: 2rem 1rem;
  }
  
  .se-logo {
    max-width: 180px;
  }
  
  .title {
    font-size: clamp(1.5rem, 3vw, 2.4rem); /* Match StartOverlayDK small desktop */
    margin-top: 2.5rem; /* Match SlidingPuzzleDK placement */
    width: 75vw;
    max-width: 75vw;
  }
}

/* Larger desktop screens (1920px+, etc.) */
@media (min-width: 1600px) {
  .competition-form-view {
    padding: 2rem 1rem;
  }
  
  .se-logo {
    max-width: 190px;
  }
  
  .title {
    font-size: clamp(1.6rem, 2.8vw, 2.6rem); /* Match StartOverlayDK large desktop */
    margin-top: 2.5rem; /* Match SlidingPuzzleDK placement */
    width: 70vw;
    max-width: 70vw;
  }
}

/* Typeform container responsive helpers */
@media (max-width: 1200px) {
  .typeform-container {
    width: min(84vw, 520px);
    height: clamp(520px, 78vh, 900px);
  }
}

@media (max-width: 1024px) {
  .typeform-container {
    width: min(88vw, 520px);
    height: clamp(500px, 78vh, 860px);
    --tf-desktop-scale: 1;
  }
}

@media (min-width: 1400px) {
  .typeform-container {
    --tf-desktop-scale: 0.86;
    width: min(68vw, 500px);
    height: clamp(520px, 72vh, 900px);
  }
}

@media (min-width: 1700px) {
  .typeform-container {
    --tf-desktop-scale: 0.82;
    width: min(60vw, 480px);
    height: clamp(520px, 70vh, 880px);
  }
}

@media (min-width: 2000px) {
  .typeform-container {
    --tf-desktop-scale: 0.78;
  }
}

</style>

