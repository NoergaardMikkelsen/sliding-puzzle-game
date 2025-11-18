<template>
  <div class="endgame-view">
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
  background-image: url('/images/dk_julekalender/SE_Julekampagne_bg_desktop.jpg');
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
    background-image: url('/images/dk_julekalender/SE_Julekampagne_bg_mobile.jpg');
  }
}

/* Small mobile: Position to focus on bottom 80% of image - ensures people are visible */
@media (max-width: 600px) {
  .endgame-view {
    background-position: center 80%;
  }
}

.title {
  font-size: 3rem;
  font-weight: bold;
  color: var(--light);
  font-family: 'Arial Rounded MT Pro', Arial, sans-serif;
  position: relative;
  z-index: 1;
  margin: 0;
}

.message {
  font-size: 1.5rem;
  color: var(--light);
  line-height: 1.6;
  max-width: 600px;
  position: relative;
  z-index: 1;
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
  z-index: 1;
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
    padding-top: 6rem;
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
  }
}

</style>

