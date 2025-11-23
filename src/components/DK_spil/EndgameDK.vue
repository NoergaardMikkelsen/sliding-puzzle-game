<template>
  <div class="endgame-view">
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
    <h1 class="title">{{ props.gaveUp ? 'Godt forsøgt' : 'Godt klaret' }}</h1>

    <!-- Message -->
    <div class="message">
      <template v-if="props.gaveUp">
        Udfyld formularen på næste side og tilmeld dig nyhedsbrevet.<br><br>Så har du ét lod i konkurrencen om <span class="line-break-after-om"><br></span>masser af fede præmier 🎁
      </template>
      <template v-else>
        Udfyld formularen på næste side og tilmeld dig nyhedsbrevet.<br><br>Så har du ét lod i konkurrencen om <span class="line-break-after-om"><br></span>masser af fede præmier 🎁
      </template>
    </div>

    <!-- Action button -->
    <button class="competition-button" @click="handleCompetitionClick">
      Deltag i konkurrence
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Snowflake from './Snowflake.vue';

const router = useRouter();

// Props
const props = defineProps({
  timeMs: {
    type: Number,
    required: true
  },
  gaveUp: {
    type: Boolean,
    default: false
  },
  dayNumber: {
    type: Number,
    default: null
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

function handleCompetitionClick() {
  // Log end click to Vercel (fire-and-forget)
  try {
    if (import.meta.env.PROD && props.dayNumber) {
      const eventName = `DK_${props.dayNumber}end_click`;
      const payload = JSON.stringify({ event: eventName });
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/track', blob);
      } else {
        fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true });
      }
    }
  } catch (e) {}
  // Navigate using explicit path to avoid undefined URLs
  const targetPath = props.dayNumber
    ? `/dk_julekalender/konkurrence?day=${props.dayNumber}`
    : '/dk_julekalender/konkurrence';
  router.push(targetPath);
}
</script>

<style scoped>
.endgame-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; /* Match CompetitionFormDK */
  gap: 1rem;
  padding: 2rem 1rem; /* Match CompetitionFormDK padding */
  text-align: center;
  color: var(--light);
  position: fixed; /* Match CompetitionFormDK - fixed to fill screen */
  top: 0;
  left: 0;
  width: 100vw;
  min-height: 100svh; /* Match CompetitionFormDK - use small viewport height */
  height: 100svh; /* Match CompetitionFormDK - use small viewport height */
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
  font-size: clamp(1.5rem, 4vw, 3rem); /* Match StartOverlayDK sizes */
  font-weight: bold;
  color: var(--light);
  font-family: 'Arial Rounded MT Pro', Arial, sans-serif;
  position: relative;
  z-index: 3; /* Ensure content is above layout elements */
  margin: 0;
  margin-top: 2.5rem; /* Match StartOverlayDK placement */
  margin-bottom: 0.5rem;
  text-align: center;
  width: 80vw;
  max-width: 80vw;
  padding: 0 1rem;
}

.message {
  font-size: 1.2rem; /* Desktop size - larger than mobile */
  color: var(--light);
  line-height: 1.6;
  max-width: 600px;
  width: 100%;
  position: relative;
  z-index: 3; /* Ensure content is above layout elements */
  font-family: 'Arial Rounded MT Pro', Arial, sans-serif;
  margin-top: 0;
}

.line-break-after-om {
  display: none;
}

@media (min-width: 481px) {
  .line-break-after-om {
    display: inline;
  }
}

.registered-symbol {
  font-size: 0.5em;
  vertical-align: super;
  line-height: 0;
  position: relative;
  top: -0.3em;
}

.competition-button {
  background: var(--brand);
  color: var(--light);
  border: none;
  border-radius: 0.75rem;
  padding: 0.80rem 2rem;
  font-family: 'Arial Rounded MT Pro', Arial, sans-serif;
  font-size: 1rem; /* Desktop size - larger than mobile */
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  position: relative;
  z-index: 3; /* Ensure content is above layout elements */
}

.competition-button:hover {
  background: var(--brand-dark);
  transform: translateY(-2px) scale(1.03);
}

/* Responsive design */
@media (max-width: 768px) {
  .endgame-view {
    padding: 1rem 1rem; /* Match CompetitionFormDK mobile padding */
    gap: 1rem; /* Match CompetitionFormDK mobile gap */
  }
  
  .se-logo {
    max-width: 140px;
  }
  
  .title {
    font-size: clamp(1.2rem, 3.5vw, 1.8rem); /* Match StartOverlayDK mobile */
    margin-top: 2.5rem; /* Match CompetitionFormDK placement */
    width: 90vw;
    max-width: 90vw;
    padding: 0 0.5rem;
  }
  
  .message {
    font-size: 17px; /* Match heading sizes - larger on mobile for better readability */
    padding: 0 1rem;
  }
  
  .competition-button {
    padding: 0.60rem 1.5rem;
    font-size: 17px; /* Match heading sizes - larger on mobile for better readability */
  }
}

@media (max-width: 600px) {
  .se-logo {
    max-width: 100px;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 20px; /* Match StartOverlayDK - larger for better readability */
    margin-top: 2.5rem; /* Match CompetitionFormDK placement */
    width: 95vw;
    max-width: 95vw;
    padding: 0 0.5rem;
  }
  
  .message {
    font-size: 17px; /* Follow heading size increase - larger on small mobile for better readability */
    padding: 0 0.5rem;
  }
  
  .competition-button {
    padding: 0.60rem 1.2rem;
    font-size: 17px; /* Follow heading size increase - larger on small mobile for better readability */
  }
}

/* Tablet - Smaller tablets around 820px */
@media (min-width: 769px) and (max-width: 900px) {
  .endgame-view {
    padding: 2rem 1rem;
  }
  
  .se-logo {
    max-width: 160px;
  }
  
  .title {
    font-size: clamp(2.2rem, 4vw, 2.8rem); /* Larger to ensure it's not smaller than mobile */
    margin-top: 2.5rem; /* Match CompetitionFormDK placement */
    width: 78vw;
    max-width: 78vw;
  }
}

/* Tablet - Larger tablets */
@media (min-width: 901px) and (max-width: 1200px) {
  .endgame-view {
    padding: 2rem 1rem;
  }
  
  .se-logo {
    max-width: 180px;
  }
  
  .title {
    font-size: clamp(2.4rem, 4vw, 4rem); /* Match StartOverlayDK tablet */
    margin-top: 2.5rem; /* Match CompetitionFormDK placement */
    width: 78vw;
    max-width: 78vw;
  }
}

/* Smaller desktop (MacBook Air 13", etc.) */
@media (min-width: 1200px) and (max-width: 1600px) {
  .endgame-view {
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
  .endgame-view {
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

</style>

