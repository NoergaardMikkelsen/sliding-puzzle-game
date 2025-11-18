<template>
  <div 
    ref="hoverArea"
    class="calendar-door-wrapper"
    :class="{ 'animating': isOpening }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="handleClick"
  >
    <!-- Image behind the door - show when hovering or door is opened -->
    <img 
      v-if="(isHovering || (isDoorOpen && selectedDay === dayNumber)) && isActive" 
      :src="`/images/dk_julekalender/door${dayNumber}/${getImagePrefix(dayNumber)}_00.jpg`" 
      alt="Full puzzle image" 
      class="door-image-behind"
      @click="handleClick"
    />
    
    <!-- Door container that maintains position - prevents hinge from moving -->
    <div 
      ref="doorContainer"
      class="door-container"
    >
    <!-- The actual door -->
    <div 
      ref="doorElement"
      class="calendar-door"
      :class="{ 
        'active': isActive, 
        'inactive': !isActive, 
        'glowing': dayNumber === 1 && isActive,
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

function handleClick() {
  if (props.isActive && !props.isDoorOpen) {
    emit('door-click', props.dayNumber);
  }
}

function handleMouseEnter(event) {
  // Only enable hover on desktop (1024px and above)
  if (window.innerWidth < 1024) return;
  
  if (doorElement.value && doorContainer.value && props.isActive && !props.isDoorOpen) {
    isHovering.value = true;
    
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
      }, 100); // Small delay to ensure smooth transition
    }
  });
}

// Keep door open when isDoorOpen is true (after click)
watch(() => props.isDoorOpen, (isDoorOpen) => {
  if (isDoorOpen && doorElement.value && doorContainer.value && props.selectedDay === props.dayNumber) {
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

/* Only show pointer cursor on desktop where hover works */
@media (max-width: 1023px) {
  .calendar-door-wrapper {
    cursor: default;
  }
}

.door-image-behind {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.25rem;
  z-index: 1;
  opacity: 1; /* Visible immediately when door starts opening */
  transform: translateZ(-1px); /* Put image behind the door */
  cursor: pointer; /* Make it clear the image is clickable */
  pointer-events: auto; /* Ensure image is clickable when visible */
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
}

.calendar-door.hovering {
  /* When door is open on hover, allow clicks to pass through to image behind */
  /* The image behind will handle the click */
  pointer-events: none;
}

.calendar-door.active {
  background-color: var(--brand); /* Bright green */
  color: var(--light); /* White text */
}

.calendar-door.active.darker-green {
  background-color: #218a30; /* Darker green for checkerboard pattern */
}

.calendar-door.inactive {
  background-color: var(--brand); /* Same bright green as active */
  opacity: 0.4; /* Reduced opacity for inactive state */
  color: var(--light); /* White text */
}

.calendar-door.inactive.darker-green {
  background-color: #218a30; /* Same darker green as active darker-green */
  opacity: 0.4; /* Reduced opacity for inactive state */
  color: var(--light); /* White text */
}

.calendar-door.active.glowing {
  box-shadow: 0 0 25px rgba(173, 216, 255, 0.5), 
              0 0 40px rgba(173, 216, 255, 0.3),
              0 0 55px rgba(173, 216, 255, 0.2);
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
