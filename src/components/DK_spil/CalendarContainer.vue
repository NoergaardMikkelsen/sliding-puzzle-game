<template>
  <div class="calendar-container">
    <CalendarDoor
      v-for="day in 24"
      :key="day"
      :day-number="day"
      :is-active="isDayActive(day)"
      :is-configured="isDayConfigured(day)"
      :is-future="isDayFuture(day)"
      :is-opening="selectedDay === day && isDoorOpening"
      :selected-day="selectedDay"
      :is-door-open="isDoorOpen"
      @door-click="handleDoorClick"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import CalendarDoor from './CalendarDoor.vue';

const props = defineProps({
  selectedDay: {
    type: Number,
    default: null
  },
  isDoorOpening: {
    type: Boolean,
    default: false
  },
  isDoorOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['door-click']);

// Track which days have puzzle images (not disabled)
const activeDays = ref([1, 2, 3, 4, 5, 8, 9, 10, 11, 12, 15, 16, 17, 18, 19, 22, 23]); // Based on the image
// Check if a day is part of the active calendar configuration (has assets)
function isDayConfigured(day) {
  return activeDays.value.includes(day);
}


function getReferenceDate() {
  return new Date();
}

// Check if a specific date has been reached
function isDateReached(day) {
  const now = getReferenceDate();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11 (0=January, 11=December)
  const currentDay = now.getDate();
  
  // Special case: Door 1 is always accessible until December 2nd
  if (day === 1) {
    // Door 1 is open from now until December 2nd
    if (currentMonth < 11) {
      return true; // Always open before December
    }
    if (currentMonth === 11 && currentDay < 2) {
      return true; // Open on December 1st
    }
    return false; // Closed from December 2nd onwards
  }
  
  // Target date for this door: December [day], current year, 00:00:00
  const targetDate = new Date(currentYear, 11, day, 0, 0, 0);
  
  // If we're before December (January - November), no doors should be open yet
  if (currentMonth < 11) {
    return false;
  }
  
  // If we're in December, check if this specific day has been reached
  if (currentMonth === 11) {
    return now >= targetDate;
  }
  
  // This shouldn't happen (month is always 0-11), but just in case
  return false;
}

// Check if a day is both in the active days list AND the date has been reached
function isDayActive(day) {
  // Day must be in the active days list
  if (!activeDays.value.includes(day)) {
    return false;
  }
  
  // Check if the date for this day has been reached
  // (Currently disabled - see isDateReached function)
  return isDateReached(day);
}

// Check if a day is in the future (in activeDays but date not reached yet)
function isDayFuture(day) {
  // Day must be in the active days list
  if (!activeDays.value.includes(day)) {
    return false; // Not in activeDays = permanently disabled, not future
  }
  
  // If day is in activeDays but date hasn't been reached, it's future
  return !isDateReached(day);
}

// Check if a day has been completed (game finished)
function isDayCompleted(dayNumber) {
  try {
    const stored = localStorage.getItem('dk_julekalender_completed_days');
    if (!stored) return false;
    const completedDays = JSON.parse(stored);
    return completedDays.includes(dayNumber);
  } catch (e) {
    return false;
  }
}

// Check if a day has passed (date is now in the past)
function isDayPassed(dayNumber) {
  const now = getReferenceDate();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();
  
  // Special case: Door 1 only passes on December 2nd or later
  if (dayNumber === 1) {
    if (currentMonth < 11) {
      return false; // Before December, door 1 is not passed
    }
    if (currentMonth === 11) {
      return currentDay >= 2; // Passed on December 2nd or later
    }
    return false;
  }
  
  // If we're not in December, no days have passed
  if (currentMonth !== 11) {
    return false;
  }
  
  // A day has passed if current day is GREATER than this day
  // E.g., if it's December 3rd, days 1 and 2 have passed (but not day 3)
  return currentDay > dayNumber;
}

function handleDoorClick(dayNumber) {
  // Don't allow click if day has passed (date moved to next day)
  if (isDayPassed(dayNumber)) {
    return;
  }
  
  // Allow click if day is active (both in activeDays and date reached)
  // Even if completed - user can replay the game on the same day
  if (isDayActive(dayNumber)) {
    emit('door-click', dayNumber);
  }
}
</script>

<style scoped>
.calendar-container {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 0.75rem;
  width: 100%;
  max-width: 800px;
  padding: 1rem;
  margin: 0 auto;
  transform-style: preserve-3d;
  perspective: 5000px; /* Higher perspective value = less distortion, more stable hinge */
  perspective-origin: center center;
}



/* Smaller desktop (MacBook Air 13", etc.) */
@media (min-width: 1200px) and (max-width: 1600px) {
  .calendar-container {
    max-width: 600px;
    gap: 0.55rem;
    padding: 0.8rem;
  }
}

/* Larger desktop screens (1920px+, etc.) */
@media (min-width: 1600px) {
  .calendar-container {
    max-width: 700px;
    gap: 0.6rem;
    padding: 0.85rem;
  }
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .calendar-container {
    gap: 0.5rem;
    padding: 0.75rem;
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .calendar-container {
    gap: 0.4rem;
    padding: 0;
  }
}
</style>

