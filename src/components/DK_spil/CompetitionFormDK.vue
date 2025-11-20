<template>
  <div class="competition-form-view">
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
          data-tf-live="01KAGN31T56MKJ2NRPSYRX9PTX"
          data-tf-width="100%"
          data-tf-height="100%"
        ></div>
      </div>
      
      <!-- Mobile Typeform -->
      <div class="typeform-mobile">
        <div 
          data-tf-live="01KAGN5HMP7M8TQ3JCTAW9ATRY"
          data-tf-width="100%"
          data-tf-height="100%"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
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

onMounted(() => {
  generateSnowflakes();
  
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
  window.addEventListener('message', (event) => {
    // Typeform sends completion events
    if (event.data && event.data.type === 'form-submit' || event.data.type === 'TF_FORM_SUBMIT') {
      // Navigate to thanks page when form is submitted
      const dayNumber = route.query.day ? parseInt(route.query.day) : null;
      router.push({ 
        name: 'thanks',
        query: { day: dayNumber }
      });
    }
  });
}

</script>

<style scoped>
.competition-form-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 1.5rem;
  padding: 1.5rem 2rem;
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
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--light);
  font-family: 'Arial Rounded MT Pro', Arial, sans-serif;
  position: relative;
  z-index: 3;
  margin: 1rem 0 0.5rem 0;
}

.typeform-container {
  position: relative;
  width: 100%;
  max-width: 550px;
  height: 87vh;
  min-height: 800px;
  max-height: 1100px;
  z-index: 3;
  margin: 0.5rem 0;
  transform-origin: center top;
  overflow: hidden;
}

.typeform-web {
  display: block;
  width: 100%;
  height: 100%;
  transform: scale(0.8);
  transform-origin: center top;
}

.typeform-mobile {
  display: none;
  width: 100%;
  height: 100%;
  transform: scale(0.8);
  transform-origin: center top;
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
  
  .typeform-mobile {
    display: block;
  }
  
  .typeform-container {
    height: 75vh;
    min-height: 650px;
    max-height: 900px;
    max-width: 100%;
    padding: 0 1rem;
  }
  
  .typeform-web,
  .typeform-mobile {
    transform: scale(0.85);
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
    padding: 1.5rem;
    gap: 1.5rem;
    justify-content: flex-start;
    padding-top: 8rem;
  }
  
  .title {
    font-size: 2.5rem;
    margin-top: 0;
  }
}

@media (max-width: 400px) {
  .title {
    font-size: 2rem;
  }
}

</style>

