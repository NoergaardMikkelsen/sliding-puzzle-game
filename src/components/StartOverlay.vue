<template>
  <!-- Start screen overlay component -->
  <div class="start-screen-overlay">
    <div class="start-screen-content">
      <!-- Hero container with image and overlaid elements -->
      <div class="hero-container">
        <!-- Puzzle preview image -->
        <picture class="start-preview-img">
          <source media="(max-width: 1024px)" srcset="/images/43598_SE_Proud_to_be_Pro_Game_01_Start_SE_mobile.webp" fetchpriority="high" />
          <img ref="previewImg" src="/images/43598_SE_Proud_to_be_Pro_Game_01_Start_SE_desktop.webp" alt="Puzzle preview" fetchpriority="high" />
        </picture>
        
        <!-- Modern promo headline overlaid on image -->
        <div ref="startHeadline" class="start-headline">Ta chansen att vinna 2 biljetter till <br class="mobile-only"><span>NHL i Stockholm!</span></div>
        
        <!-- Lower container with description and button overlaid on image -->
        <div ref="startLowerContainer" class="start-lower-container">
          <div class="start-desc">Kan du slå Elektrikerpoddens<br><span>pusseltid</span> </div>
          <button ref="startBtn" class="start-btn" @click="$emit('start-game')">Klara, färdiga, gå</button>
        </div>
        <div ref="disclaimer" class="start-disclaimer">För att vara med i tävlingen behöver du fylla dina uppgifter efter pusslet. Alla vinnare slumpas fram.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// Defines the events that this component can emit
const emit = defineEmits(['start-game']);

// Refs for dynamic positioning
const startLowerContainer = ref(null);
const startHeadline = ref(null);
const disclaimer = ref(null);
const startBtn = ref(null);
const previewImg = ref(null);

// Function to calculate image size
function updateImageSize() {
  if (!previewImg.value) return;
  
  const viewportWidth = window.innerWidth;
  const useMobileImage = viewportWidth <= 1024;
  const isSmallScreen = viewportWidth <= 500; // iPhone 12 portrait ~390px
  
  if (isSmallScreen) {
    // Very small screens: Use contain to show full image
    previewImg.value.style.objectFit = 'contain';
    // Do not hug the bottom on small mobiles; center the image vertically
    previewImg.value.style.objectPosition = 'center center';
  } else if (useMobileImage) {
    // 501px-1024px: Fill and bias towards bottom so logo stays visible
    previewImg.value.style.objectFit = 'cover';
    previewImg.value.style.objectPosition = 'center 95%';
  } else {
    // Desktop 1024px+: Use cover
    previewImg.value.style.objectFit = 'contain';
    previewImg.value.style.objectPosition = 'center bottom';
    previewImg.value.style.paddingBottom = '0px';
  }
}

// Function to position start-lower-container
function updateContainerPosition() {
  if (!startLowerContainer.value) return;
  if (!startHeadline.value) return;
  
  const viewportWidth = window.innerWidth;
  
  if (viewportWidth <= 768) {
    // Mobile: Responsive positioning - smaller screen = closer to bottom
    let bottomValue;
    let topValue;
    let fontSize; 
    if (viewportWidth <= 375) {
      // iPhone SE and smaller: closer to bottom
      bottomValue = '10%';
      topValue = '1%';
      fontSize = '1.3rem';
    } else if (viewportWidth <= 500) {
      // iPhone Plus and similar: medium distance
      bottomValue = '15%';
      topValue = '1%';
      fontSize = '1.5rem';
      
    } else if (viewportWidth <= 540) {
      // iPhone Plus and similar: medium distance
      bottomValue = '15%';
      topValue = '1%';
      fontSize = '2.3rem';
      
    } else {
      // iPad and larger mobile: higher up
      bottomValue = '8rem';
      topValue = '1rem'
      fontSize = '2.8rem';
    }
    startLowerContainer.value.style.bottom = bottomValue;
    startHeadline.value.style.top = topValue; 
    startHeadline.value.style.fontSize = fontSize;
  } else if (viewportWidth <= 1024) {
    // Tablet
    startLowerContainer.value.style.bottom = '10rem';
    startHeadline.value.style.top = '2%';
    startHeadline.value.style.fontSize = '2.5rem';
  } else if (viewportWidth <= 1440) {
    // Small Desktop (MacBook Air 13")
    startLowerContainer.value.style.bottom = '5%';
    startHeadline.value.style.top = '1%';
    startHeadline.value.style.fontSize = '3rem';
  } else if (viewportWidth <= 1920) {
    // Medium Desktop (MacBook Air 15")
    startLowerContainer.value.style.bottom = '5%';
    startHeadline.value.style.top = '1%';
    startHeadline.value.style.fontSize = '3.5rem';
  } else {
    // Large Desktop
    startLowerContainer.value.style.bottom = '7rem';
    startHeadline.value.style.top = '1.5%';
    startHeadline.value.style.fontSize = '4rem';
  }
}

// Function to calculate disclaimer position
function updateDisclaimerPosition() {
  if (!disclaimer.value) return;
  
  const viewportWidth = window.innerWidth;
  const useMobileImage = viewportWidth <= 1024; // Same logic as image selection
  
  if (useMobileImage) {
    // Mobile and tablet up to 1024px: Position at bottom of screen
    disclaimer.value.style.top = 'auto';
    // Rely on hero-container padding-bottom to reserve UI space
    disclaimer.value.style.bottom = 'calc(env(safe-area-inset-bottom, 0px) + 0rem)';
    disclaimer.value.style.position = 'absolute';
    disclaimer.value.style.left = '50%';
    disclaimer.value.style.transform = 'translateX(-50%)';
  } else {
    // Desktop 1024px+: Position below start-btn
    if (!startLowerContainer.value) return;
    // Place disclaimer 1rem below the start-lower-container (which holds the button)
    const margin = 16; // 1rem on desktop
    const topPosition = startLowerContainer.value.offsetTop + startLowerContainer.value.offsetHeight + margin;
    
    disclaimer.value.style.top = `${topPosition}px`;
    disclaimer.value.style.bottom = 'auto';
    disclaimer.value.style.position = 'absolute';
    disclaimer.value.style.left = '50%';
    disclaimer.value.style.transform = 'translateX(-50%)';
  }
}

// Update all on resize
function handleResize() {
  updateImageSize();
  updateContainerPosition();
  updateDisclaimerPosition();
}

onMounted(() => {
  // Compute initial iOS UI offset for safe area handling
  function updateSafeAreaOffset() {
    const vv = window.visualViewport;
    const viewportHeight = vv ? vv.height : window.innerHeight;
    const uiOffset = Math.max(0, window.innerHeight - viewportHeight);
    document.documentElement.style.setProperty('--ios-ui-offset', uiOffset + 'px');
  }

  updateSafeAreaOffset();
  updateImageSize();
  updateContainerPosition();
  updateDisclaimerPosition();
  window.addEventListener('resize', handleResize);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateSafeAreaOffset);
    window.visualViewport.addEventListener('scroll', updateSafeAreaOffset);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (window.visualViewport) {
    window.visualViewport.removeEventListener('resize', () => {});
    window.visualViewport.removeEventListener('scroll', () => {});
  }
});
</script>

<style scoped>
/* ===========================
   Base Layout & Overlay
   =========================== */
.start-screen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100svh;
  background-color: var(--black);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 900;
}

.start-screen-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  min-height: 86svh;
  max-width: 100vw;
  overflow: visible; /* allow disclaimer to be visible at bottom */
}

.hero-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
  /* Reserve space for disclaimer on mobile/tablet and browser UI */
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + var(--ios-ui-offset, 0px));
}

/* ===========================
   Image
   =========================== */
.start-preview-img {
  position: relative;
  width: 100%;
  max-height: 95vh; /* Forhindrer stretching i iframe */
  overflow: hidden;
}

.start-preview-img img {
  width: 100%;
  height: 100%;
  max-height: 100vh; /* Forhindrer stretching i iframe */
  object-fit: contain;
  border-radius: var(--radius);
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  display: block;
}

/* JavaScript handles image positioning dynamically */

/* ===========================
   Headline
   =========================== */
.start-headline {
  font-family: 'Arial Rounded MT Pro', Arial, Helvetica, sans-serif;
  font-weight: bold;
  font-style: italic;
  color: var(--light);
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 80vw;
  max-width: 80vw;
  text-align: center;
  z-index: 2;
  font-size: clamp(2rem, 5vw, 3.5rem);
  top: 2%;
}

.start-headline span {
  color: var(--brand);
  white-space: nowrap;
}

.mobile-only {
  display: none;
}

/* ===========================
   Lower Container
   =========================== */
.start-lower-container {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  text-align: center;
  z-index: 2;
  bottom: clamp(3rem, 10vh, 5rem);
}

/* Desktop: Move container higher up */
@media (min-width: 769px) {
  .start-lower-container {
    bottom: clamp(3rem, 15vh, 6rem);
  }
}

/* Large desktop: Even higher */
@media (min-width: 1200px) {
  .start-lower-container {
    bottom: clamp(4rem, 20vh, 8rem);
  }
}

.start-desc {
  font-family: 'Arial Rounded MT Pro', Arial, Helvetica, sans-serif;
  font-weight: bold;
  color: var(--light);
  line-height: 1.5;
  font-size: clamp(1rem, 2.5vw, 2rem);
}

.start-desc span {
  color: var(--brand);
}

/* ===========================
   Button
   =========================== */
.start-btn {
  padding: 0.85rem 2.5rem;
  background: var(--brand);
  color: var(--light);
  border: none;
  border-radius: 0.75rem;
  font-family: 'Arial Rounded MT Pro', Arial, Helvetica, sans-serif;
  font-weight: bold;
  margin-bottom: 1rem;
  margin-top: 1rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  transition: background 0.15s, color 0.15s, transform 0.1s;
  font-size: clamp(0.9rem, 2vw, 2rem);
}
.start-btn:hover {
  background: var(--brand-dark);
  color: var(--light);
  transform: translateY(-2px) scale(1.03);
}

/* ===========================
   Disclaimer
   =========================== */
.start-disclaimer {
  position: absolute;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 0.5rem);
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  font-size: clamp(0.55rem, 1.5vw, 0.75rem);
  line-height: 1.15;
  color: rgba(255,255,255,0.75);
  text-align: center;
  max-width: 80vw;
  padding-bottom: env(safe-area-inset-bottom, 0.5rem);
  z-index: 1001; /* ensure above image and overlays */
}

/* JavaScript handles disclaimer positioning dynamically */

/* ===========================
   Responsive
   =========================== */

/* Mobile-first */
@media (max-width: 400px) {
  .start-disclaimer {
    font-size: 0.5rem;
  }
}
@media (max-width: 768px) {
  .mobile-only {
    display: inline;
  }

  /* Ensure overlay respects visible viewport on mobile Safari */
  .start-screen-overlay {
    height: 100svh;
  }


  .start-preview-img {
    height: auto;
  }

  .hero-container {
    padding-bottom: calc(env(safe-area-inset-bottom, 0px) + var(--ios-ui-offset, 0px) + 12px);
    max-height: 90vh; /* Forhindrer at hero containeren bliver for lang på mobil */
  }

  .start-headline {
    font-size: clamp(1.8rem, 5vw, 2.2rem);
    width: 90vw;
    top: clamp(0.5rem, 3vh, 2rem);
  }

  .start-lower-container {
    bottom: clamp(2rem, 6vh, 4rem);
  }

  .start-disclaimer {
    max-width: 95vw;
    margin-top: 0.25rem;
  }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1200px) {
  .start-headline {
    font-size: clamp(1.8rem, 3vw, 3rem);
    top: clamp(1rem, 4vh, 3rem);
    max-width: 78vw;
  }

  .start-desc {
    font-size: 1.4rem;
  }

  .start-btn {
    font-size: 1.2rem;
    padding: 0.7rem 2rem;
  }

  .start-lower-container {
    bottom: clamp(3rem, 8vh, 5rem);
  }
}
</style>