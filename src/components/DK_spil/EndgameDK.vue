<template>
  <div class="endgame-view">
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
    <h1 class="title">{{ props.gaveUp ? 'Godt forsøgt' : 'Godt klaret' }}</h1>

    <!-- Message -->
    <div class="message">
      <template v-if="props.gaveUp">
        Du får alligevel et lod med i konkurrencen. <br>Husk at deltage igen i morgen, hvor der kommer et nyt produkt og muligheden for endnu et lod 😊
      </template>
      <template v-else>
        Du får et lod med i konkurrencen. <br>Husk at deltage igen i morgen, hvor der kommer et nyt produkt og muligheden for endnu et lod 😊
      </template>
    </div>

    <!-- Action button -->
    <button class="win-button" @click="handleWinClick">
      Se flere LK<sup class="registered-symbol">®</sup> One produkter
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Snowflake from './Snowflake.vue';

// Props
const props = defineProps({
  timeMs: {
    type: Number,
    required: true
  },
  gaveUp: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['win-click']);

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
});

// Methods
function handleWinClick() {
  // Log end click to Vercel (fire-and-forget)
  try {
    if (import.meta.env.PROD) {
      const payload = JSON.stringify({ event: 'DK_end_click' });
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/track', blob);
      } else {
        fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true });
      }
    }
  } catch (e) {}
  // TODO: Update with actual Danish products URL
  window.open('https://cloud.go.se.com/SE_202410_LPElectricians_CNT_NONE_ELECTRICIANS_HD_PW1_ACQ_NA-LP/', '_blank');
  emit('win-click');
}
</script>

<style scoped>
.endgame-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 2rem;
  text-align: center;
  color: var(--light);
  position: relative;
  min-height: 100svh; /* Match StartOverlayDK - use small viewport height */
  height: 100svh; /* Match StartOverlayDK - use small viewport height */
  overflow: hidden;
  background-color: var(--black);
  background-image: url('/images/dk_julekalender/layout/SE_Julekampagne_bg_desktop_2x.webp');
  background-size: cover;
  background-repeat: no-repeat;
}

/* Fallback for browsers that don't support svh */
@supports not (height: 1svh) {
  .endgame-view {
    height: 100vh;
    min-height: 100vh;
  }
}

/* Mobile background image - up to 1024px */
@media (max-width: 1024px) {
  .endgame-view {
    background-image: url('/images/dk_julekalender/layout/SE_Julekampagne_bg_mobile.webp');
  }
}

/* Small mobile: Position to focus on bottom 80% of image - ensures people are visible */
@media (max-width: 600px) {
  .endgame-view {
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

.title {
  font-size: 3rem;
  font-weight: bold;
  color: var(--light);
  font-family: 'Arial Rounded MT Pro', Arial, sans-serif;
  position: relative;
  z-index: 3; /* Ensure content is above layout elements */
  margin: 0;
}

.message {
  font-size: 1.5rem;
  color: var(--light);
  line-height: 1.6;
  max-width: 600px;
  position: relative;
  z-index: 3; /* Ensure content is above layout elements */
  font-family: 'Arial Rounded MT Pro', Arial, sans-serif;
}

.registered-symbol {
  font-size: 0.5em;
  vertical-align: super;
  line-height: 0;
  position: relative;
  top: -0.3em;
}

.win-button {
  background: var(--brand);
  color: var(--light);
  border: none;
  border-radius: 0.75rem;
  padding: 0.80rem 2rem;
  font-family: 'Arial Rounded MT Pro', Arial, sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  position: relative;
  margin-bottom: 2rem;
  z-index: 3; /* Ensure content is above layout elements */
}

.win-button:hover {
  background: var(--brand-dark);
  transform: translateY(-2px) scale(1.03);
}

/* Responsive design */
@media (max-width: 768px) {
  .endgame-view {
    padding: 1.5rem;
    gap: 1.5rem;
    justify-content: flex-start;
    padding-top: 10rem;
  }
  
  .title {
    font-size: 2.5rem;
    margin-top: 0;
  }
  
  .message {
    font-size: 1.2rem;
    padding: 0 1rem;
  }
  
  .win-button {
    padding: 0.70rem 1.5rem;
    font-size: 1.3rem;
    margin-bottom: 0rem;
  }
}

@media (max-width: 400px) {
  .title {
    font-size: 2rem;
  }
  
  .message {
    font-size: 1rem;
    padding: 0 0.5rem;
  }
  
  .win-button {
    padding: 0.60rem 1.2rem;
    font-size: 1.1rem;
    margin-bottom: 0rem;
  }
}

</style>

