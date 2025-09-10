<template>
  <div class="scoreboard-view">
    <!-- Your time display -->
    <div class="time-display">
      <div class="time-label">Your time</div>
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
      Fill out your info for the chance to flex your skills with pro-league caps - or win the grand prize:
    </div>

    <!-- Prize display -->
    <div class="prize">
      2 tickets to [SPORTING EVENT]
    </div>

    <!-- Action button -->
    <button class="win-button" @click="handleWinClick">
      I want to win
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

// Hardcoded ambassador times in milliseconds
const ambassador1TimeMs = 1 * 60000 + 54 * 1000; // 01:54
const ambassador2TimeMs = 2 * 60000 + 15 * 1000; // 02:15

// Computed
const formattedTime = computed(() => {
  if (props.gaveUp) {
    return "Gave up";
  }
  const minutes = Math.floor(props.timeMs / 60000);
  const seconds = Math.floor((props.timeMs % 60000) / 1000);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

// Create sorted times array with player position
const sortedTimes = computed(() => {
  const times = [
    { timeMs: ambassador1TimeMs, label: "Ambassador 1", time: "01:54", isPlayer: false },
    { timeMs: ambassador2TimeMs, label: "Ambassador 2", time: "02:15", isPlayer: false },
    { timeMs: props.timeMs, label: "Your time:", time: formattedTime.value, isPlayer: true }
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
    return "You did not beat our Schneider Electric ambassadors – but don't worry!";
  }
  const position = playerPosition.value;
  if (position === 1) {
    return "Wow, congratulations! You beat two of our Schneider Electric ambassadors.";
  } else if (position === 2) {
    return "You beat one of our Schneider Electric ambassadors, nice one!";
  } else {
    return "You did not beat our Schneider Electric ambassadors – but don't worry!";
  }
});

// Methods
function handleWinClick() {
  window.open('https://www.youtube.com/watch?v=xvFZjo5PgG0&list=RDxvFZjo5PgG0&start_radio=1', '_blank');
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
  font-size: 1.2rem;
  color: var(--light);
}

.time-value {
  font-size: 3rem;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  color: var(--light);
}

.congratulations {
  font-size: 1.1rem;
  color: var(--light);
  max-width: 500px;
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
  font-family: 'Courier New', monospace;
  font-weight: 300;
}

.call-to-action {
  font-size: 1rem;
  color: var(--light);
  max-width: 500px;
  line-height: 1.4;
}

.prize {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--brand);
}

.win-button {
  background: var(--brand);
  color: var(--light);
  border: none;
  border-radius: 0.75rem;
  padding: 0.60rem 2rem;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}

.win-button:hover {
  background: var(--brand-dark);
  transform: translateY(-2px) scale(1.03);
}

/* Responsive design */
@media (max-width: 768px) {
  .scoreboard-view {
    padding: 1rem;
    gap: 1rem;
  }
  
  .time-value {
    font-size: 2.5rem;
  }
  
  .congratulations {
    font-size: 1rem;
  }
  
  .comparison-box {
    min-width: 280px;
    padding: 1rem;
  }
  
  .call-to-action {
    font-size: 0.9rem;
  }
  
  .prize {
    font-size: 1.3rem;
  }
  
  .win-button {
    padding: 0.8rem 1.5rem;
    font-size: 1.1rem;
  }
}
</style>
