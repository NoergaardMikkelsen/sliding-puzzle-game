<template>
  <div class="scoreboard-view">
    <!-- Your time display -->
    <div class="time-display">
      <div class="time-label">Din tid</div>
      <div class="time-value">{{ formattedTime }}</div>
    </div>

    <!-- Congratulations message based on performance -->
    <div class="congratulations">
      {{ congratulationsMessage }}
    </div>

    <!-- Time comparison box -->
    <div class="comparison-box">
      <div 
        v-for="(entry, index) in sortedTimes" 
        :key="index"
        class="comparison-item"
        :class="{ 'highlighted': entry.isPlayer }"
      >
        <span class="label">{{ entry.label }}</span>
        <span class="time">{{ entry.time }}</span>
      </div>
    </div>

    <!-- Call to action text -->
    <div class="call-to-action">
      Fyll i dina uppgifter för att ha chansen att vinna kepsen eller det stora priset:
    </div>

    <!-- Prize display -->
    <div class="prize">
      2 biljetter till <br><span class="nhl-highlight">NHL i Stockholm</span>
    </div>

    <!-- Action button -->
    <button class="win-button" @click="handleWinClick">
      Till formuläret
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';

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

// Hardcoded ambassador times in milliseconds (match displayed labels)
const billyTimeMs = 8 * 1000;            // 00:08
const ambassador1TimeMs = 3 * 60000 + 20 * 1000; // 03:20 (Viktor)
const ambassador2TimeMs = 52 * 1000;     // 00:52 (Peter)

// Computed
const formattedTime = computed(() => {
  if (props.gaveUp) {
    return "Du gav upp";
  }
  const minutes = Math.floor(props.timeMs / 60000);
  const seconds = Math.floor((props.timeMs % 60000) / 1000);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

function formatMs(ms) {
  const minutes = Math.floor(ms / 60000).toString().padStart(2, '0');
  const seconds = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

// Create sorted times array with player position
const sortedTimes = computed(() => {
  const times = [
    { timeMs: billyTimeMs, label: "Billy:", time: formatMs(billyTimeMs), isPlayer: false },
    { timeMs: ambassador1TimeMs, label: "Viktor:", time: formatMs(ambassador1TimeMs), isPlayer: false },
    { timeMs: ambassador2TimeMs, label: "Peter:", time: formatMs(ambassador2TimeMs), isPlayer: false },
    { timeMs: props.timeMs, label: "Din tid:", time: formattedTime.value, isPlayer: true }
  ];
  
  // Sort by time (fastest first)
  return times.sort((a, b) => a.timeMs - b.timeMs);
});

// Get player position (1st, 2nd, or 3rd place)
const playerPosition = computed(() => {
  return sortedTimes.value.findIndex(entry => entry.isPlayer) + 1;
});

// Dynamic congratulations message based on position
const congratulationsMessage = computed(() => {
  if (props.gaveUp) {
    return "Du slutförde inte pusslet – men ingen fara, du har chans till vinst i alla fall";
  }
  const position = playerPosition.value;
  if (position === 1) {
    return "Wow, grattis! Du har slagit alla av medlemmarna i Elektrikerpodden";
  } else if (position === 2) {
    return "Wow, grattis! Du har slagit en eller flera av medlemmarna i Elektrikerpodden";
  } else if (position === 3) {
    return "Wow, grattis! Du har slagit en eller flera av medlemmarna i Elektrikerpodden";
  } else {
    return "Du slog inte någon av medlemmarna i Elektrikerpodden - ingen fara du kan fortfarande vinna!";
  }
});

// Methods
function handleWinClick() {
  window.open('https://cloud.go.se.com/SE_202509_ProudToBeProPuzzle_MULTI_NONE_ELECTRICIANS_HD_PW1_ACQ_NA-LP', '_blank');
  emit('win-click');
}
</script>

<style scoped>
.scoreboard-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  text-align: center;
  color: var(--light);
}

.time-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.time-label {
  font-size: 2rem;
  color: var(--light);
}

.time-value {
  font-size: 5rem;
  font-weight: bold;
  font-family: 'Arial Rounded MT Pro', Arial, sans-serif;
  color: var(--light);
}

.congratulations {
  font-size: 1.8rem;
  color: var(--light);

  line-height: 1.4;
}

.comparison-box {
  background: var(--brand);
  border-radius: 1rem;
  padding: 1.2rem 1.5rem;
  min-width: 320px;
}

.comparison-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  color: var(--light);
}

.comparison-item:not(:last-child) {
  border-bottom: 2px solid rgba(255, 255, 255, 0.8);
}

.comparison-item.highlighted {
  background: none;
}

.comparison-item.highlighted .label,
.comparison-item.highlighted .time {
  font-weight: 900;
  font-size: 1.05em;
}

.label {
  font-weight: 300;
}

.time {
  font-family: 'Arial Rounded MT Pro', Arial, sans-serif;
  font-weight: 300;
}

.call-to-action {
  font-size: 1.6rem;
  color: var(--light);
  line-height: 1.4;
}

.prize {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--light);
}

.nhl-highlight {
  color: var(--brand);
  font-weight: 900;
}

.win-button {
  background: var(--brand);
  color: var(--light);
  border: none;
  border-radius: 0.75rem;
  padding: 0.60rem 2rem;
  font-family: 'Arial Rounded MT Pro', Arial, sans-serif;
  font-size: 2rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}

.win-button:hover {
  background: var(--brand-dark);
  transform: translateY(-2px) scale(1.03);
}

/* Responsive design */
@media (max-width: 1024px) {
  .scoreboard-view {
    padding: 2rem;
    gap: 1.5rem;
  }
}


@media (max-width: 768px) {
  .scoreboard-view {
    padding: 1rem;
    gap: 1rem;
  }
  
  .time-value {
    font-size: 3.5rem;
  }
  
  .congratulations {
    font-size: 1.3rem;
  }
  
  .comparison-box {
    min-width: 280px;
    padding: 1.2rem;
  }
  
  .call-to-action {
    font-size: 1.2rem;
  }
  
  .prize {
    font-size: 1.8rem;
  }
  
  .win-button {
    padding: 0.8rem 1.5rem;
    font-size: 1.5rem;
  }
}
@media (max-width: 400px) {
  .time-label{
    font-size: 1.5rem;
  }
  .time-value {
    font-size: 1.5rem;
  }
  .congratulations {
    font-size: 1rem;
  }
  .comparison-box {
    min-width: 240px;
    padding: 0.7rem 1rem;
  }
  .call-to-action {
    font-size: 0.9rem;
  }
  .prize {
    font-size: 1.2rem;
    line-height: 1.2;
  }
  .win-button {
    padding: 0.6rem 1rem;
    font-size: 1.2rem;
  }
  .comparison-item {
    font-size: 0.9rem;
  }
  .label {
    font-size: 0.9rem;
  }
  .time {
    font-size: 0.9rem;
  }
  .comparison-item.highlighted .label,
  .comparison-item.highlighted .time {
    font-size: 0.9rem;
  }
}
</style>
