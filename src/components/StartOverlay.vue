<template>
  <!-- Start screen overlay component -->
  <div class="start-screen-overlay">
    <div class="start-screen-content">
      <!-- Hero container with image and overlaid elements -->
      <div class="hero-container">
        <!-- Puzzle preview image -->
        <picture class="start-preview-img">
          <source media="(max-width: 768px)" srcset="/images/43598_SE_Proud_to_be_Pro_Game_Mobile.jpg" />
          <img src="/images/43598_SE_Proud_to_be_Pro_Game_Desktop.jpg" alt="Puzzle preview" fetchpriority="high" />
        </picture>
        
        <!-- Modern promo headline overlaid on image -->
        <div class="start-headline">Win 2 tickets to <br class="mobile-only"><span>[SPORTING EVENT]</span><br>by luck of the draw</div>
        
        <!-- Lower container with description and button overlaid on image -->
        <div class="start-lower-container">
          <div class="start-desc">Can you beat our<br><span>puzzle time?</span> </div>
          <button class="start-btn" @click="$emit('start-game')">Ready, set, play!</button>
          <div class="start-disclaimer">to enter the competition, you will need to provide your contact information after the game</div>
        </div>
      </div>
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
  height: 100%;
  color: var(--light); /* Uses CSS variable for light text color */
  margin: 0 auto;
  text-align: center;
  gap: 1rem; /* Spacing between elements */
  position: relative;
}

/* Hero container with image and overlaid elements */
.hero-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

/* Headline for the start overlay */
.start-headline {
  font-family: 'Arial', Helvetica, sans-serif;
  font-size: 2.3rem;
  font-weight: bold;
  font-style: italic;
  color: var(--light);
  position: absolute;
  top: clamp(1rem, 4vw, 4rem);
  left: 50%;
  transform: translateX(-50%);
  width: 80vw;
  max-width: 80vw;
  text-align: center;
  z-index: 2;
}

.start-headline span {
  color: var(--brand);
  white-space: nowrap;
}

/* Mobile-only line break helper */
.mobile-only {
  display: none;
}

.start-desc span {
  color: var(--brand);
}

.start-desc {
  font-family: 'Arial', Helvetica, sans-serif;
  font-weight: bold;
  font-size: 1.4rem;
  color: var(--light);
  line-height: 1.5; /* Improves readability */
}

.start-lower-container {
  position: absolute;
  bottom: clamp(-2rem, 2vw, 1.25rem);
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  text-align: center;
  z-index: 2;
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
  margin-bottom: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10); /* Subtle shadow for depth */
  transition: background 0.15s, color 0.15s, transform 0.1s; /* Smooth transitions for hover effects */
}
.start-btn:hover {
  background: var(--brand-dark); /* Darker green on hover */
  color: var(--light); /* Keep white text on hover */
  transform: translateY(-2px) scale(1.03); /* Slight lift and scale effect on hover */
}

/* Small legal/disclaimer text */
.start-disclaimer {
  margin-top: 0.5rem;
  font-size: 0.72rem;
  line-height: 1.15;
  color: rgba(255,255,255,0.75);
  text-align: center;
  max-width: 80vw;
  margin-left: auto;
  margin-right: auto;
}

/* Preview image in the start overlay */
.start-preview-img {
  display: block;
  width: 100%;
  max-width: 100vw;
  max-height: 90vh;
}

.start-preview-img img {
  width: 100%;
  height: auto;
  border-radius: var(--radius);
  box-shadow: 0 4px 24px rgba(0,0,0,0.10); /* Larger shadow for the image */
  display: block;
}

/* Responsive design for StartOverlay */
@media (max-width: 768px) {
  .start-screen-content {
    max-width: 100vw;
  }
  
  .hero-container {
    width: 100%;
  }
  
  .start-preview-img {
    max-width: 100%;
  }
  
  .start-headline {
    font-size: clamp(1.35rem, 4.2vw, 1.8rem);
    width: 90vw;
    max-width: 80vw;
    top: -0.5rem;
  }

  .mobile-only {
    display: inline;
  }
  
  .start-desc {
    font-size: 1.2rem;
  }
  
  .start-btn {
    padding: 0.8rem 2.5rem;
    font-size: 1.1rem;
  }

  /* Anchor CTA block to the bottom of the screen on mobile */
  .start-lower-container {
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    bottom: calc(env(safe-area-inset-bottom, 0) + 0.75rem);
    width: 100%;
  }

  .start-disclaimer {
    font-size: 0.55rem;
    max-width: 100vw;
    margin-top: 0.25rem;
  }
}

/* Tablet / small-desktop range where things looked oversized */
@media (min-width: 780px) and (max-width: 1000px) {
  .start-headline {
    font-size: clamp(1.6rem, 2.8vw, 2.2rem);
    top: clamp(1rem, 3vw, 3rem);
    max-width: 78vw;
  }

  .start-lower-container {
    bottom: clamp(-2rem, 0.8vw, 1rem);
  }

  .start-btn {
    padding: 0.55rem 1.6rem;
    font-size: 1.05rem;
  }

  .start-desc {
    font-size: 1.1rem;
  }
}

/* Tight breakpoint to fix overlap right below 780px */
@media (min-width: 738px) and (max-width: 780px) {
  .start-headline {
    font-size: clamp(1.4rem, 2.6vw, 1.9rem);
    top: clamp(0.25rem, 2vw, 1rem);
    max-width: 82vw;
  }

  .start-lower-container {
    bottom: -3rem;
  }

  .start-btn {
    padding: 0.55rem 1.6rem;
    font-size: 1.05rem;
  }
}
</style> 