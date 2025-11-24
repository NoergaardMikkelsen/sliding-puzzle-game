<template>
  <div 
    ref="hoverArea"
    class="calendar-door-wrapper"
    :class="{ 'animating': isOpening, 'day-passed': isDayPassed, 'future-door': isFuture }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="!isDayPassed && !isFuture && handleClick()"
  >
    <!-- Image behind the door - show when hovering, door is opened, or (ACTIVE) day has passed -->
    <div 
      v-if="(isHovering || (isDoorOpen && selectedDay === dayNumber) || (isDayPassed && isActive)) && isActive"
      class="door-image-wrapper"
      :class="{ 
        'permanently-visible': isDayPassed && isActive,
        'darker-green-overlay': isDarkerGreen && isDayPassed && isActive
      }"
      @click="!isDayPassed && handleClick()"
    >
      <img 
        :src="`/images/dk_julekalender/door${dayNumber}/${getImagePrefix(dayNumber)}_00.jpg`" 
        alt="Full puzzle image" 
        class="door-image-behind"
      />
    </div>
    
    <!-- Door container that maintains position - prevents hinge from moving -->
    <!-- Hide door ONLY if it's an ACTIVE day that has passed (inactive days always show the door) -->
    <div 
      v-if="!(isDayPassed && isActive)"
      ref="doorContainer"
      class="door-container"
    >
    <!-- The actual door -->
    <div 
      ref="doorElement"
      class="calendar-door"
      :class="{ 
        'active': isActive, 
        'inactive': !isActive && !isFuture, 
        'future': isFuture,
        'glowing': dayNumber === currentDay && isActive && !isDayPassed,
        'darker-green': isDarkerGreen,
        'opened': isDoorOpen && selectedDay === dayNumber,
        'hovering': isHovering
      }"
    >
      <span class="door-number">{{ dayNumber }}</span>
    </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue';
import gsap from 'gsap';

const props = defineProps({
  dayNumber: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isFuture: {
    type: Boolean,
    default: false
  },
  isOpening: {
    type: Boolean,
    default: false
  },
  selectedDay: {
    type: Number,
    default: null
  },
  isDoorOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['door-click']);
const doorElement = ref(null);
const doorContainer = ref(null);
const isHovering = ref(false);
let doorAnimation = null;

// Mapping between door numbers and image prefixes
const dayToPrefixMap = {
  1: '01', 2: '02', 3: '03', 4: '04', 5: '05',
  8: '06', 9: '07', 10: '08', 11: '09', 12: '10',
  15: '11', 16: '12', 17: '13', 18: '14', 19: '15',
  22: '16', 23: '17'
};

function getImagePrefix(dayNumber) {
  return dayToPrefixMap[dayNumber] || String(dayNumber).padStart(2, '0');
}

// Checkerboard pattern: darker green for positions 2,4,6,7,9,11,14,16,18,19,21,23
// Grid is 4 rows x 6 columns
const darkerGreenDays = [2, 4, 6, 7, 9, 11, 14, 16, 18, 19, 21, 23];

const isDarkerGreen = computed(() => {
  return darkerGreenDays.includes(props.dayNumber);
});

const TEST_FORCE_DECEMBER_FIRST = true; // Aligns with CalendarContainer testing override

function getReferenceDate() {
  const now = new Date();
  if (TEST_FORCE_DECEMBER_FIRST) {
    now.setMonth(11); // December
    now.setDate(1); // Unlock door 1 without marking it as passed
    now.setHours(0, 0, 1, 0);
  }
  return now;
}

function getCurrentDay() {
  return getReferenceDate().getDate();
}

// Get current day for glow effect
const currentDay = computed(() => {
  return getCurrentDay();
});

// Check if this day has been completed (game finished) - PRODUCTION VERSION
function isDayCompleted(dayNumber) {
  // Temporarily disabled until final launch
  return false;
}

// Check if this day has passed (like ripping off the door in a real calendar)
// OR if the game has been completed for this day - TEST: December 3rd
const isDayPassed = computed(() => {
  // First check if the game has been completed for this day
  if (isDayCompleted(props.dayNumber)) {
    return true;
  }
  
  const now = getReferenceDate();
  const currentMonth = now.getMonth(); // 0-11 (0=January, 11=December)
  const day = now.getDate();
  
  // If we're not in December, no days have passed yet
  if (currentMonth !== 11) {
    return false;
  }
  
  // If current day is greater than this door's day, the day has passed
  // E.g., if it's December 3rd, days 1 and 2 have passed
  return day > props.dayNumber;
});

function handleClick() {
  // Only allow clicking if day is active, door is not open, day hasn't passed, and it's not a future day
  // Once a day has passed, the door is "ripped off" and cannot be clicked
  // Future days cannot be clicked either
  if (props.isActive && !props.isFuture && !props.isDoorOpen && !isDayPassed.value) {
    emit('door-click', props.dayNumber);
  }
}

function handleMouseEnter(event) {
  // Only enable hover on desktop (1024px and above)
  if (window.innerWidth < 1024) return;
  
  // Don't show hover effect if day has passed (door is already "ripped off") or if it's a future day
  if (isDayPassed.value || props.isFuture) return;
  
  if (doorElement.value && doorContainer.value && props.isActive && !props.isDoorOpen) {
    isHovering.value = true;
    
    // Stop CSS wiggle animation explicitly
    if (doorElement.value) {
      doorElement.value.style.animation = 'none';
    }
    
    // Kill any existing animation
    if (doorAnimation) {
      doorAnimation.kill();
    }
    
    // Keep container at ABSOLUTELY fixed position (this holds the hinge point in place)
    // Container must stay at (0,0,0) to prevent any movement of the hinge
    gsap.set(doorContainer.value, {
      x: 0,
      y: 0,
      z: 0,
      clearProps: "transform" // Clear any previous transforms
    });
    
    // Position door so its left edge aligns with container's left edge
    // This ensures the hinge (left side) stays at the same absolute position
    // Door's transform-origin is at left center, so left edge should be at container's left
    gsap.set(doorElement.value, {
      transformOrigin: "left center",
      backfaceVisibility: "visible",
      x: 0, // Door's left edge at container's left edge (hinge stays fixed)
      y: 0,
      z: 0,
      clearProps: "transform" // Clear any previous transforms
    });
    
    // Adjust rotation angle based on position - doors to the right need more rotation
    // to open as much as doors to the left (due to perspective distortion)
    const gridColumn = (props.dayNumber - 1) % 6; // 0-5 (6 columns)
    const centerCol = 2.5; // Center of 6 columns
    const horizontalDistance = gridColumn - centerCol; // -2.5 to +2.5
    
    // Base rotation angle
    const baseRotation = -85;
    // Doors to the right need more negative rotation (more open) to appear equal
    // Very subtle adjustment: +2 degrees for every unit right of center
    const rotationAdjustment = Math.max(0, horizontalDistance) * 2; // Max +5 degrees for rightmost door
    const rotationY = baseRotation - rotationAdjustment; // More negative = more open
    
    // Use fixed z-value - rotation adjustment handles the visual difference
    const zValue = 15;
    
    // Animate door opening outward (towards user) on hover
    // Container stays fixed at (0,0,0) to keep hinge point stable
    // Only door rotates - its left edge (hinge) stays aligned with container's left edge
    doorAnimation = gsap.to(doorElement.value, {
      rotationY: rotationY, // Position-adjusted rotation
      // x and y must stay 0 to keep hinge at container's left edge
      x: 0, // Critical: keeps left edge aligned with container's left edge
      y: 0, // Keep vertical position
      z: zValue, // Fixed z-value
      duration: 0.6,
      ease: "back.out(1.7)",
      force3D: true,
      // Ensure transform-origin is explicitly maintained during animation
      transformOrigin: "left center",
    });
  }
}

function handleMouseLeave(event) {
  // Only enable hover on desktop (1024px and above)
  if (window.innerWidth < 1024) return;
  
  // Don't close door if day has passed (door is already "ripped off")
  if (isDayPassed.value) return;
  
  if (!doorElement.value || !doorContainer.value || !props.isActive || props.isDoorOpen) return;
  
  // Don't set isHovering to false immediately - keep image visible during closing animation
  // isHovering will be set to false after door is closed
  
  // Kill any existing animation
  if (doorAnimation) {
    doorAnimation.kill();
  }
  
  // Keep container absolutely fixed at origin
  gsap.set(doorContainer.value, {
    x: 0,
    y: 0,
    z: 0,
    clearProps: "transform"
  });
  
  // Animate door closing back
  doorAnimation = gsap.to(doorElement.value, {
    rotationY: 0,
    x: 0,
    y: 0,
    z: 0,
    duration: 0.6,
    ease: "back.in(1.7)",
    onComplete: () => {
      // Hide image with a small delay after door is fully closed
      // This prevents the image from blinking away just before door closes
      setTimeout(() => {
        isHovering.value = false;
        // Restart wiggle animation when door is fully closed (if door is glowing)
        if (doorElement.value && props.isActive && !isDayPassed.value) {
          doorElement.value.style.animation = '';
        }
      }, 100); // Small delay to ensure smooth transition
    }
  });
}

// Keep door open when isDoorOpen is true (after click)
watch(() => props.isDoorOpen, (isDoorOpen) => {
  if (isDoorOpen && doorElement.value && doorContainer.value && props.selectedDay === props.dayNumber) {
    // Stop CSS wiggle animation when door is permanently opened
    if (doorElement.value) {
      doorElement.value.style.animation = 'none';
    }
    
    // Kill any existing animation
    if (doorAnimation) {
      doorAnimation.kill();
    }
    
    // Keep container absolutely fixed at origin (hinge point must stay here)
    gsap.set(doorContainer.value, {
      x: 0,
      y: 0,
      z: 0,
      clearProps: "transform"
    });
    
    // Use same position-based rotation adjustment as hover
    const gridColumn = (props.dayNumber - 1) % 6;
    const centerCol = 2.5;
    const horizontalDistance = gridColumn - centerCol;
    
    const baseRotation = -85;
    const rotationAdjustment = Math.max(0, horizontalDistance) * 2; // Match hover calculation
    const rotationY = baseRotation - rotationAdjustment;
    
    const zValue = 15;
    
    // Set final open state - door lying flat open
    // Door's left edge must remain aligned with container's left edge (hinge point)
    gsap.set(doorElement.value, {
      rotationY: rotationY, // Position-adjusted rotation to match hover
      x: 0, // Critical: keeps left edge (hinge) aligned with container's left edge
      y: 0, // Keep vertical position
      z: zValue, // Fixed z-value
      transformOrigin: "left center",
      backfaceVisibility: "visible",
      force3D: true,
    });
  }
});

onMounted(() => {
  // Initialize transform origin and position
  if (doorContainer.value) {
    gsap.set(doorContainer.value, {
      x: 0,
      y: 0,
      z: 0
    });
  }
  if (doorElement.value) {
    gsap.set(doorElement.value, {
      transformOrigin: "left center",
      x: 0,
      y: 0,
      z: 0
    });
  }
});
</script>

<style scoped>
.calendar-door-wrapper {
  position: relative;
  aspect-ratio: 1;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  perspective: inherit;
  overflow: visible;
  cursor: pointer; /* Show pointer cursor on entire area */
}

/* Disable cursor and pointer events when day has passed */
.calendar-door-wrapper.day-passed {
  cursor: default;
  pointer-events: none;
}

/* Disable pointer events for future doors - but keep default cursor */
.calendar-door-wrapper.future-door {
  cursor: default;
  pointer-events: none;
}

/* Only show pointer cursor on desktop where hover works */
@media (max-width: 1023px) {
  .calendar-door-wrapper {
    cursor: default;
  }
}

.door-image-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  cursor: pointer;
  pointer-events: auto;
}

.door-image-behind {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.25rem;
  opacity: 1; /* Visible immediately when door starts opening */
  transform: translateZ(-1px); /* Put image behind the door */
  display: block;
}

.door-image-wrapper.permanently-visible {
  z-index: 3; /* Show above everything when day has passed (door is "ripped off") */
  cursor: default; /* Not clickable when day has passed */
  pointer-events: none; /* Disable clicking when day has passed */
}

.door-image-wrapper.permanently-visible .door-image-behind {
  transform: translateZ(0); /* Bring image to front */
  border-radius: 0.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2); /* Add subtle shadow for depth */
  filter: grayscale(100%) brightness(0.6); /* More grayed out when day has passed */
  opacity: 0.7; /* More reduced opacity for grayed out effect */
}

/* Greenish overlay on passed days - light green for normal doors */
.door-image-wrapper.permanently-visible::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(61, 205, 87, 0.4); /* Light green overlay (var(--brand)) with opacity */
  border-radius: 0.25rem;
  pointer-events: none;
  z-index: 2; /* Above the image but below the ripped edge */
  mix-blend-mode: overlay; /* Blend with the image for a more natural look */
}

/* Darker green overlay for darker green doors (checkerboard pattern) */
.door-image-wrapper.permanently-visible.darker-green-overlay::after {
  background: rgba(42, 157, 63, 0.4); /* Slightly lighter dark green overlay (#2a9d3f) with opacity */
}

/* Visual indication of "ripped off" door on the left side */
.door-image-wrapper.permanently-visible::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 10px; /* Width of the "ripped" edge */
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.4) 0%,
    rgba(0, 0, 0, 0.3) 15%,
    rgba(0, 0, 0, 0.2) 30%,
    rgba(0, 0, 0, 0.1) 50%,
    transparent 100%
  );
  border-radius: 0.25rem 0 0 0.25rem;
  pointer-events: none;
  z-index: 4; /* Above the image */
  /* Create a jagged/ripped edge effect */
  clip-path: polygon(
    0% 0%,
    100% 3%,
    0% 6%,
    100% 9%,
    0% 12%,
    100% 15%,
    0% 18%,
    100% 21%,
    0% 24%,
    100% 27%,
    0% 30%,
    100% 33%,
    0% 36%,
    100% 39%,
    0% 42%,
    100% 45%,
    0% 48%,
    100% 51%,
    0% 54%,
    100% 57%,
    0% 60%,
    100% 63%,
    0% 66%,
    100% 69%,
    0% 72%,
    100% 75%,
    0% 78%,
    100% 81%,
    0% 84%,
    100% 87%,
    0% 90%,
    100% 93%,
    0% 96%,
    100% 100%,
    0% 100%
  );
}

.door-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  /* Container stays fixed at (0,0,0) to prevent hinge (left edge) from moving */
  /* Hinge position is defined by this container's position */
}

.calendar-door {
  position: relative;
  aspect-ratio: 1;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  transform-origin: 0% 50%; /* Hængslet på venstre side */
  z-index: 2;
  transform-style: preserve-3d;
  backface-visibility: visible; /* Keep door visible when rotated */
}

.calendar-door.opened {
  /* GSAP handles the animation, disable pointer events when door is permanently open (after click) */
  pointer-events: none;
  will-change: transform;
  animation: none; /* Stop wiggle animation when door is opened */
}

.calendar-door.hovering {
  /* When door is open on hover, allow clicks to pass through to image behind */
  /* The image behind will handle the click */
  pointer-events: none;
  animation: none; /* Stop wiggle animation when door is hovering/open */
}

.calendar-door.active {
  background-color: var(--brand); /* Bright green */
  color: var(--light); /* White text */
}

.calendar-door.active.darker-green {
  background-color: #2a9d3f; /* Slightly lighter dark green for checkerboard pattern */
}

.calendar-door.inactive {
  background-color: var(--brand); /* Same bright green as active */
  opacity: 0.4; /* Reduced opacity for inactive state */
  color: var(--light); /* White text */
}

.calendar-door.inactive.darker-green {
  background-color: #2a9d3f; /* Same slightly lighter dark green as active darker-green */
  opacity: 0.4; /* Reduced opacity for inactive state */
  color: var(--light); /* White text */
}

/* Future doors (not yet reached) - look exactly like active doors but not clickable */
.calendar-door.future {
  background-color: var(--brand); /* Bright green - same as active */
  color: var(--light); /* White text - same as active */
  opacity: 1; /* Full opacity - no transparency like inactive doors */
  cursor: default; /* Default cursor - not clickable */
  /* No special border or shadow - looks exactly like active door */
}

.calendar-door.future.darker-green {
  background-color: #2a9d3f; /* Slightly lighter dark green for checkerboard pattern - same as active darker-green */
  opacity: 1; /* Full opacity */
  /* No special border or shadow - looks exactly like active darker-green door */
}

.calendar-door.active.glowing {
  box-shadow: 0 0 30px rgba(173, 216, 255, 0.7), 
              0 0 50px rgba(173, 216, 255, 0.5),
              0 0 70px rgba(173, 216, 255, 0.4),
              0 0 90px rgba(173, 216, 255, 0.3);
  animation: wiggle 2s ease-in-out infinite;
}

/* Wiggle animation for active glowing door */
@keyframes wiggle {
  0%, 100% {
    transform: rotate(0deg);
  }
  10% {
    transform: rotate(-3deg);
  }
  20% {
    transform: rotate(3deg);
  }
  30% {
    transform: rotate(-2deg);
  }
  40% {
    transform: rotate(2deg);
  }
  50% {
    transform: rotate(-1deg);
  }
  60% {
    transform: rotate(1deg);
  }
  70%, 100% {
    transform: rotate(0deg);
  }
}

/* Hover effect removed - GSAP handles door opening on hover now */

.door-number {
  font-size: clamp(1.5rem, 4.5vw, 3.5rem);
  font-weight: bold;
  font-family: 'Arial Rounded MT Pro', Arial, Helvetica, sans-serif;
}

/* Smaller desktop (MacBook Air 13", etc.) */
@media (min-width: 1200px) and (max-width: 1600px) {
  .door-number {
    font-size: clamp(1.2rem, 3.5vw, 2.5rem);
  }
}

/* Larger desktop screens (1920px+, etc.) */
@media (min-width: 1600px) {
  .door-number {
    font-size: clamp(1.3rem, 3.2vw, 2.8rem);
  }
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .door-number {
    font-size: clamp(1.6rem, 4.5vw, 2.8rem);
  }
}

@media (max-width: 480px) {
  .door-number {
    font-size: clamp(1.4rem, 4vw, 2.2rem);
  }
}
</style>
