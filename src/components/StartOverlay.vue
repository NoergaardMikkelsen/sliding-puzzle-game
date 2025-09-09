<template>
  <!-- Start screen overlay component -->
  <div class="start-screen-overlay">
    <div class="start-screen-content">
      <!-- Modern promo headline -->
      <div class="start-headline">Kan du gennemføre?</div>
      <!-- Description with highlight -->
      <div class="start-desc">
        Prøv vores sliding puzzle - kun 60% gennemfører spillet inden for tidsgrænsen! Er du én af dem?
      </div>
      <!-- Start button that emits an event when clicked -->
      
      <!-- Puzzle preview image -->
      <img class="start-preview-img" src="/images/puzz.png" alt="Puzzle preview" />
      <button class="start-btn" @click="$emit('start-game')">Ready, set, play!</button>
    </div>
  </div>
</template>

<script setup>
// Defines the events that this component can emit
const emit = defineEmits(['start-game']);
</script>

<style scoped>
/* Styles for the start screen overlay and its content */

/* Overlay for the start screen */
.start-screen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: var(--black); /* Uses black background */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 900; /* Ensures it's above other content */
}

/* Content inside the start overlay */
.start-screen-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--light); /* Uses CSS variable for light text color */
  max-width: 480px;
  margin: 0 auto;
  text-align: center;
  gap: 1rem; /* Spacing between elements */
}

/* Headline for the start overlay */
.start-headline {
  font-family: 'Arial', Helvetica, sans-serif;
  font-size: 2.3rem;
  font-weight: bold;
  font-style: italic;
  color: var(--light);
  margin-bottom: 0.7rem;
  margin-top: 0.5rem;
}

/* Description text in the start overlay */
.start-desc {
  font-size: 1.15rem;
  color: var(--light);
  margin-bottom: 0.7rem;
  line-height: 1.5; /* Improves readability */
}

/* Highlighted text in the start overlay description */
.start-highlight {
  font-weight: bold;
  font-style: italic;
  color: var(--brand-dark, #008a15); /* Uses CSS variable for dark brand color */
}

/* Start button styling */
.start-btn {
  padding: 0.60rem 2rem;
  background: var(--brand);
  color: var(--light);
  border: none;
  border-radius: 0.75rem;
  font-size: 1.3rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1.2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10); /* Subtle shadow for depth */
  transition: background 0.15s, color 0.15s, transform 0.1s; /* Smooth transitions for hover effects */
}
.start-btn:hover {
  background: var(--brand-dark); /* Darker green on hover */
  color: var(--light); /* Keep white text on hover */
  transform: translateY(-2px) scale(1.03); /* Slight lift and scale effect on hover */
}

/* Preview image in the start overlay */
.start-preview-img {
  width: 100%;
  max-width: 90vw; /* Ensures responsiveness on smaller screens */
  border-radius: var(--radius);
  box-shadow: 0 4px 24px rgba(0,0,0,0.10); /* Larger shadow for the image */
  margin: 0 auto;
  display: block;
}

/* Responsive design for StartOverlay */
@media (max-width: 768px) {
  .start-screen-content {
    max-width: 95vw;
    padding: 1rem;
  }
  
  .start-headline {
    font-size: 1.8rem;
  }
  
  .start-desc {
    font-size: 1rem;
  }
  
  .start-btn {
    padding: 0.8rem 2.5rem;
    font-size: 1.1rem;
  }
}

@media (min-width: 769px) {
  .start-screen-content {
    max-width: 480px;
  }
}
</style> 