<template>
  <div class="calendar-container">
    <CalendarDoor
      v-for="day in 24"
      :key="day"
      :day-number="day"
      :is-active="isDayActive(day)"
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

// Check if a specific date has been reached
// TEMPORARILY DISABLED: All doors are now accessible regardless of date
// To re-enable: Remove the return true below and uncomment the logic
function isDateReached(day) {
  // TEMPORARILY DISABLED - Allow all doors
  return true;
  
  /* COMMENTED OUT - Original date checking logic
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11 (0=January, 11=December)
  const currentDay = now.getDate();
  
  // Door 1 (December 1st) is always available
  if (day === 1) {
    return true;
  }
  
  // Target date for this door: December [day], current year, 00:00:00
  const targetDate = new Date(currentYear, 11, day, 0, 0, 0);
  
  // If we're before December (January - November), no doors should be open yet (except door 1)
  // We need to check if we're before December starts (before December 1st)
  if (currentMonth < 11) {
    return false;
  }
  
  // If we're in December, check if this specific day has been reached
  if (currentMonth === 11) {
    return now >= targetDate;
  }
  
  // This shouldn't happen (month is always 0-11), but just in case
  return false;
  */
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

function handleDoorClick(dayNumber) {
  // Only allow click if day is active (both in activeDays and date reached)
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

/* Tablet */
@media (min-width: 768px) and (max-width: 1200px) {
  .calendar-container {
    margin-top: 3rem;
  }
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
    margin-top: 1rem;
  }
}
</style>

