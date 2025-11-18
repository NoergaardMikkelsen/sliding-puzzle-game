<template>
  <div 
    class="snowflake"
    :class="`snowflake-${size}`"
    :style="snowflakeStyle"
  >
    ❄
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  startPosition: {
    type: Number,
    default: 0 // Random horizontal position in percentage (0-100)
  },
  startDelay: {
    type: Number,
    default: 0 // Random vertical offset (delay in seconds, 0-10)
  },
  animationDuration: {
    type: Number,
    default: 10 // Seconds to fall
  }
});

const snowflakeStyle = computed(() => {
  // All snowflakes start from the top
  // Negative delay means animation has already started, so they appear partway down
  return {
    '--start-left': `${props.startPosition}%`,
    left: `${props.startPosition}%`,
    top: '-50px', // Always start from top
    animationDuration: `${props.animationDuration}s`,
    animationDelay: `${props.startDelay}s`
  };
});
</script>

<style scoped>
.snowflake {
  position: absolute;
  color: white;
  user-select: none;
  pointer-events: none;
  animation: 
    fall 15s linear infinite,
    sway 4s ease-in-out infinite;
  animation-fill-mode: both;
  opacity: 0.8;
  z-index: 0; /* Behind content */
}

.snowflake-small {
  font-size: 0.8rem;
}

.snowflake-medium {
  font-size: 1.2rem;
}

.snowflake-large {
  font-size: 1.8rem;
}

/* Responsive snowflake sizes */
@media (max-width: 768px) {
  .snowflake-small {
    font-size: 0.6rem;
  }
  
  .snowflake-medium {
    font-size: 0.9rem;
  }
  
  .snowflake-large {
    font-size: 1.3rem;
  }
}

@media (max-width: 480px) {
  .snowflake-small {
    font-size: 0.5rem;
  }
  
  .snowflake-medium {
    font-size: 0.75rem;
  }
  
  .snowflake-large {
    font-size: 1.1rem;
  }
}

@keyframes fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.8;
  }
  100% {
    transform: translateY(calc(100vh + 20px)) rotate(360deg);
    opacity: 0.3;
  }
}

@keyframes sway {
  0% {
    left: calc(var(--start-left) + 0px);
  }
  25% {
    left: calc(var(--start-left) + 60px);
  }
  50% {
    left: calc(var(--start-left) + 100px);
  }
  75% {
    left: calc(var(--start-left) + 60px);
  }
  100% {
    left: calc(var(--start-left) + 0px);
  }
}

/* Responsive sway distance - smaller on mobile */
@media (max-width: 768px) {
  @keyframes sway {
    0% {
      left: calc(var(--start-left) + 0px);
    }
    25% {
      left: calc(var(--start-left) + 40px);
    }
    50% {
      left: calc(var(--start-left) + 70px);
    }
    75% {
      left: calc(var(--start-left) + 40px);
    }
    100% {
      left: calc(var(--start-left) + 0px);
    }
  }
}

@media (max-width: 480px) {
  @keyframes sway {
    0% {
      left: calc(var(--start-left) + 0px);
    }
    25% {
      left: calc(var(--start-left) + 30px);
    }
    50% {
      left: calc(var(--start-left) + 50px);
    }
    75% {
      left: calc(var(--start-left) + 30px);
    }
    100% {
      left: calc(var(--start-left) + 0px);
    }
  }
}
</style>

