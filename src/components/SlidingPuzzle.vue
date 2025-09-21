<template>
  <!-- Sliding puzzle component -->
  <div class="sliding-puzzle">
    <!-- Use the new StartOverlay component, conditionally rendered -->
    <StartOverlay v-if="!gameStarted" @start-game="startGame" />

    <!-- Show scoreboard when solved -->
    <ScoreboardView 
      v-else-if="showScoreboard"
      :time-ms="gaveUp ? 999999999 : timerMs"
      :gave-up="gaveUp"
      @win-click="handleScoreboardWin"
    />
    
    <!-- Show puzzle grid, timer, and highscore if game has started -->
    <div v-else class="puzzle-section">
      <!-- Game instruction -->
      <h2 class="game-instruction">Klicka på pusselbitarna <br>så bilden blir komplett</h2>
      <!-- Modern styled timer with fixed width -->
      <div class="timer timer-fixed">{{ formattedTime }}</div>
      <!-- Puzzle grid with absolute tiles -->
      <div class="puzzle-grid puzzle-absolute" ref="gridRef">
        <div
          v-for="(tile, visualIndex) in tiles"
          :key="tile.id"
          class="puzzle-tile"
          :class="{ empty: tile.isEmpty }"
          :ref="el => tileRefs[visualIndex] = el"
          @click="moveTile(visualIndex)"
        >
          <img v-if="!tile.isEmpty" :src="tile.img" :alt="'Tile ' + tile.id" />
        </div>
      </div>
      <!-- Ready set play / Give up button -->
      <button class="shuffle-btn" :class="{ 'ghost-btn': gameInProgress }" @click="gameInProgress ? giveUp() : readySetPlay()">
        {{ gameInProgress ? 'Hjälp! Jag ger upp!' : 'Klara, färdiga, gå!' }}
      </button>
      
      <!-- Countdown overlay -->
      <div v-if="showCountdown" class="countdown-overlay">
        <div class="countdown-text">{{ countdownText }}</div>
      </div>
      <!-- Temporary button to trigger solved state for modal testing -->
      <button class="dev-solve-btn" @click="triggerSolved">Trigger Solved (Dev Only)</button>
      <!-- Show the completion dialog modal when solved (keeping for now) -->
      <CompletionDialog
        :visible="isSolved && !showScoreboard"
        :time-ms="timerMs"
        @submit="handleDialogSubmit"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import gsap from 'gsap';
import StartOverlay from './StartOverlay.vue'; // Import the new component
import CompletionDialog from './CompletionDialog.vue'; // Import the completion dialog
import ScoreboardView from './ScoreboardView.vue'; // Import the scoreboard view
// Note: animateTilePop is not used for sliding, but can be kept if you want to use it elsewhere or switch back.
// import { animateTilePop } from '../gsapTileAnimation'; 

// Timer state in ms
const timerMs = ref(0);
const timerInterval = ref(null);
const timer = computed(() => Math.floor(timerMs.value / 1000));
const milliseconds = computed(() => Math.floor((timerMs.value % 1000) / 10));
const formattedTime = computed(() => {
  const minutes = Math.floor(timerMs.value / 60000);
  const seconds = Math.floor((timerMs.value % 60000) / 1000);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

// Puzzle grid and tile state
const size = 3;
const tileCount = size * size;
const imageFilenames = [
  '43598_SE_Proud_to_be_Pro_Puzzle_1.webp',
  '43598_SE_Proud_to_be_Pro_Puzzle_2.webp',
  '43598_SE_Proud_to_be_Pro_Puzzle_3.webp',
  '43598_SE_Proud_to_be_Pro_Puzzle_4.webp',
  '43598_SE_Proud_to_be_Pro_Puzzle_5.webp',
  '43598_SE_Proud_to_be_Pro_Puzzle_6.webp',
  '43598_SE_Proud_to_be_Pro_Puzzle_7.webp',
  '43598_SE_Proud_to_be_Pro_Puzzle_8.webp'
];
const tiles = ref([]);
const isSolved = ref(false);
const gameStarted = ref(false);
const gameInProgress = ref(false);
const showScoreboard = ref(false);
const gaveUp = ref(false);
const tileRefs = ref([]); // Refs for each tile DOM element
const gridRef = ref(null); // Ref for the puzzle grid container DOM element

// Countdown state
const showCountdown = ref(false);
const countdownText = ref('');
const countdownInterval = ref(null);

// Loading state
const imagesLoaded = ref(false);
const loadingProgress = ref(0);

// Preload all images to prevent loading delays
async function preloadImages() {
  const imagePromises = imageFilenames.map((filename, index) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        loadingProgress.value = Math.round(((index + 1) / imageFilenames.length) * 100);
        resolve(img);
      };
      img.onerror = reject;
      img.src = `/images/3x3/${filename}`;
    });
  });
  
  try {
    await Promise.all(imagePromises);
    imagesLoaded.value = true;
  } catch (error) {
    console.error('Error preloading images:', error);
    // Still set as loaded to not block the game
    imagesLoaded.value = true;
  }
}

function createTiles() {
  const arr = [];
  // Add the 8 image tiles first
  for (let i = 1; i < tileCount; i++) {
    arr.push({
      id: i,
      img: `/images/3x3/${imageFilenames[i - 1]}`,
      isEmpty: false
    });
  }
  // Last tile is empty
  arr.push({ id: 0, img: '', isEmpty: true });
  return arr;
}

// Animate all tiles to their correct position based on their current index in the tiles array
function animateAllTiles() {
  const gridContainer = gridRef.value;
  if (!gridContainer || tileRefs.value.length !== tileCount) return;

  // Calculate the dimension of each tile based on the container's current width
  const tileDimension = gridContainer.offsetWidth / size;

  tiles.value.forEach((tileData, visualIndex) => {
    const domElement = tileRefs.value[visualIndex];
    if (!domElement) return;

    const targetRow = Math.floor(visualIndex / size);
    const targetCol = visualIndex % size;

    // Use GSAP to animate the tile to its new position and set its size
    gsap.to(domElement, {
      x: targetCol * tileDimension,
      y: targetRow * tileDimension,
      width: tileDimension,
      height: tileDimension,
      duration: 0.6, 
      ease: 'power3.out',
    });
  });
}

function shuffleTiles() {
  const arr = createTiles();
  
  // Start with solved state
  // Then perform a fixed number of random valid moves to shuffle
  let emptyIndex = arr.length - 1; // Empty tile starts at last position
  let lastMovedTile = -1; // Track the last moved tile to avoid repeating
  
  // Fixed number of moves for consistent difficulty
  const numMoves = 10;
  
  for (let i = 0; i < numMoves; i++) {
    const possibleMoves = [];
    
    // Check which tiles can move to the empty position
    for (let j = 0; j < arr.length; j++) {
      if (j === emptyIndex) continue;
      
      const canMove =
        (j === emptyIndex - 1 && emptyIndex % size !== 0) || // Left
        (j === emptyIndex + 1 && j % size !== 0) || // Right
        j === emptyIndex - size || // Up
        j === emptyIndex + size;    // Down
      
      if (canMove) {
        possibleMoves.push(j);
      }
    }
    
    // Remove the last moved tile from possible moves to avoid repetition
    let filteredMoves = possibleMoves;
    if (lastMovedTile !== -1 && possibleMoves.length > 1) {
      filteredMoves = possibleMoves.filter(move => move !== lastMovedTile);
    }
    
    // Pick a random valid move
    if (filteredMoves.length > 0) {
      const randomMove = filteredMoves[Math.floor(Math.random() * filteredMoves.length)];
      // Swap the tiles
      [arr[emptyIndex], arr[randomMove]] = [arr[randomMove], arr[emptyIndex]];
      // Update empty index and track the moved tile
      lastMovedTile = emptyIndex;
      emptyIndex = randomMove;
    }
  }
  
  tiles.value = arr;
  isSolved.value = false;
  resetTimer();
  // Use requestAnimationFrame for smoother animation
  requestAnimationFrame(() => animateAllTiles()); 
}

function isSolvedArr(arr) {
  // Last tile should be empty (id: 0)
  if (!arr[arr.length - 1].isEmpty) return false;
  // Rest should be in order (id: 1, 2, 3, 4, 5, 6, 7, 8)
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i].id !== i + 1) return false;
  }
  return true;
}

function moveTile(clickedVisualIndex) {
  if (!gameInProgress.value || isSolved.value) return;
  const emptyTileIndex = tiles.value.findIndex(t => t.isEmpty);

  const canMove =
    (clickedVisualIndex === emptyTileIndex - 1 && emptyTileIndex % size !== 0) || // Left
    (clickedVisualIndex === emptyTileIndex + 1 && clickedVisualIndex % size !== 0) || // Right
    clickedVisualIndex === emptyTileIndex - size || // Up
    clickedVisualIndex === emptyTileIndex + size;    // Down

  if (canMove) {
    // Swap tiles in the data array
    [tiles.value[clickedVisualIndex], tiles.value[emptyTileIndex]] = [tiles.value[emptyTileIndex], tiles.value[clickedVisualIndex]];
    
    // Use requestAnimationFrame for smoother animation
    requestAnimationFrame(() => {
      animateAllTiles();
      
      isSolved.value = isSolvedArr(tiles.value);
      if (isSolved.value) {
        stopTimer();
        showScoreboard.value = true;
        // Log completed game when puzzle is solved
        try {
          if (import.meta.env.PROD) {
            const payload = JSON.stringify({ event: 'completed_game' });
            if (navigator.sendBeacon) {
              const blob = new Blob([payload], { type: 'application/json' });
              navigator.sendBeacon('/api/track', blob);
            } else {
              fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true });
            }
          }
        } catch (e) {}
      }
    });
  }
}

async function startGame() {
  gameStarted.value = true;
  gameInProgress.value = false;
  resetTimer();
  
  // Preload images if not already loaded
  if (!imagesLoaded.value) {
    await preloadImages();
  }
  
  // Initialize with solved state (no animation)
  tiles.value = createTiles();
  
  // Use requestAnimationFrame for smoother positioning
  requestAnimationFrame(() => {
    const gridContainer = gridRef.value;
    if (!gridContainer || tileRefs.value.length !== tileCount) return;
    
    const tileDimension = gridContainer.offsetWidth / size;
    
    tiles.value.forEach((tileData, visualIndex) => {
      const domElement = tileRefs.value[visualIndex];
      if (!domElement) return;
      
      const targetRow = Math.floor(visualIndex / size);
      const targetCol = visualIndex % size;
      
      // Set position without animation - use direct style instead of GSAP for speed
      domElement.style.transform = `translate(${targetCol * tileDimension}px, ${targetRow * tileDimension}px)`;
      domElement.style.width = `${tileDimension}px`;
      domElement.style.height = `${tileDimension}px`;
    });
  });
}

function startTimer() {
  timerMs.value = 0;
  if (timerInterval.value) clearInterval(timerInterval.value);
  timerInterval.value = setInterval(() => {
    timerMs.value += 10;
  }, 10);
}
function stopTimer() {
  if (timerInterval.value) clearInterval(timerInterval.value);
  timerInterval.value = null;
}
function resetTimer() {
  stopTimer();
  timerMs.value = 0;
}

// Removed deep watch to improve performance - animations are handled manually

function triggerSolved() {
  isSolved.value = true;
  stopTimer();
  showScoreboard.value = true;
}

// Handle dialog form submission
function handleDialogSubmit(data) {
  // For now, just log the data. You can add your own logic here.
  console.log('Dialog form submitted:', data);
}

// Handle ready set play button click
function readySetPlay() {
  // Log start click to Vercel (fire-and-forget)
  try {
    if (import.meta.env.PROD) {
      const payload = JSON.stringify({ event: 'start_click' });
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/track', blob);
      } else {
        fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true });
      }
    }
  } catch (e) {}
  startCountdown();
}

// Start countdown from 3 to GO
function startCountdown() {
  showCountdown.value = true;
  let count = 3;
  
  const countdown = () => {
    if (count > 0) {
      countdownText.value = count.toString();
      count--;
      countdownInterval.value = setTimeout(countdown, 1000);
    } else {
      countdownText.value = 'GO!';
      setTimeout(() => {
        showCountdown.value = false;
        shuffleTiles();
        gameInProgress.value = true;
        startTimer();
      }, 500);
    }
  };
  
  countdown();
}

// Handle give up button click
function giveUp() {
  stopTimer();
  gaveUp.value = true;
  showScoreboard.value = true;
  // Log give up click
  try {
    if (import.meta.env.PROD) {
      const payload = JSON.stringify({ event: 'give_up_click' });
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/track', blob);
      } else {
        fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true });
      }
    }
  } catch (e) {}
}

// Handle scoreboard win button click
function handleScoreboardWin() {
  // Log end click to Vercel (fire-and-forget)
  try {
    if (import.meta.env.PROD) {
      const payload = JSON.stringify({ event: 'end_click' });
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/track', blob);
      } else {
        fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true });
      }
    }
  } catch (e) {}
  // You can add form logic here or navigate to a form page
}

// Clean up countdown on unmount
onMounted(async () => {
  gameStarted.value = false;
  gameInProgress.value = false;
  resetTimer();
  
  // Start preloading images immediately
  preloadImages();
});

// Clean up countdown interval
onUnmounted(() => {
  if (countdownInterval.value) {
    clearTimeout(countdownInterval.value);
  }
});
</script>

<style scoped>

/* --- Styles from puzzle.css (puzzle grid, timer, highscore, etc.) --- */

/* Layout for the main puzzle section */
.puzzle-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

/* Game instruction styling */
.game-instruction {
  font-size: 3rem;
  font-weight: normal;
  color: var(--light);
  margin-bottom: 0.5rem;
  text-align: center;
}

/* Timer display styling */
.timer {
  background: none;
  color: var(--light);
  font-size: 2.5rem;
  font-weight: bold;
  padding: 0;
  margin-bottom: 0;
  letter-spacing: 0.1em;
  display: inline-block;
  user-select: none;
  font-family: 'Arial Rounded MT Pro', Arial, sans-serif;
}

/* Puzzle grid container */
.puzzle-grid {
  margin-bottom: 0.5rem;
  border: 1px solid var(--light);
  border-radius: 0;
  padding: 0.5rem;
}

/* Container for absolutely positioned tiles in the puzzle grid */
.puzzle-absolute {
  position: relative;
  width: min(85vw, 30rem);
  height: min(85vw, 30rem);
  max-width: 30rem;
  max-height: 30rem;
  margin-bottom: 1.5rem;
  overflow: hidden; /* Ensure tiles don't go outside the container */
}

/* Responsive design for SlidingPuzzle */
@media (max-width: 1024px) {
  .timer {
    font-size: 3rem;
  }
  .game-instruction {
    font-size: 3.5rem;
  }
  .shuffle-btn {
    font-size: 1.8rem !important;
    padding: 1rem 2rem !important;
  }
}
@media (max-width: 768px) {
  .puzzle-absolute {
    width: min(90vw, 25rem);
    height: min(90vw, 25rem);
  }
  
  .game-instruction {
    font-size: 1.4rem;
  }
  
  .timer {
    font-size: 2rem;
  }
  
  .shuffle-btn {
    padding: 0.8rem 1.8rem !important;
    font-size: 1rem !important;
  }
  
  .dev-solve-btn {
    padding: 0.4rem 1.2rem;
    font-size: 0.9rem;
  }
}

@media (min-width: 769px) {
  .puzzle-absolute {
    width: min(50vw, 30rem);
    height: min(50vw, 30rem);
  }
}

/* Individual puzzle tile styling */
.puzzle-tile {
  position: absolute; /* Crucial for GSAP positioning */
  top: 0; /* Initial position, GSAP will animate x/y */
  left: 0; /* Initial position, GSAP will animate x/y */
  background: var(--light);
  border-radius: 0;
  box-shadow: 0 2px 12px rgba(0,0,0,0.10);
  display: flex; 
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden; 
  transition: box-shadow 0.2s, border-color 0.2s; 
  border: 1px solid transparent; 
  will-change: transform; 
  min-width: 0; 
  min-height: 0;
  user-select: none;
  z-index: 2; /* Ensure normal tiles are above empty tile */
}
.puzzle-tile:hover:not(.empty) {
  box-shadow: 0 4px 20px rgba(61,205,87,0.18);
  border-color: var(--brand);
  transform: scale(1.04); 
}
.puzzle-tile.empty {
  background: #000;
  cursor: default;
  border: 1px dashed #e0e0e000;
  z-index: 1; /* Place empty tile behind other tiles */
}
.puzzle-tile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Shuffle button styling */
.shuffle-btn {
  margin-top: 0.5rem;
  padding: 0.60rem 2rem;
  border: none;
  background: var(--brand);
  color: var(--light);
  border-radius: 0.75rem;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: background 0.15s, transform 0.1s, border 0.15s;
  user-select: none;
}
.shuffle-btn:hover {
  background: var(--brand-dark);
  transform: translateY(-2px) scale(1.03);
}

/* Ghost button styling for "Help! I give up" state */
.shuffle-btn.ghost-btn {
  background: var(--brand);
  border: none;
  color: var(--light);
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  font-family: 'Arial Rounded MT Pro', Arial, sans-serif;
}
.shuffle-btn.ghost-btn:hover {
  background: var(--brand-dark);
  transform: translateY(-2px) scale(1.03);
}

/* Temporary button styling */
.dev-solve-btn {
  margin-top: 0.5rem;
  padding: 0.5rem 1.5rem;
  background: var(--brand);
  color: var(--light);
  border: none;
  border-radius: 1rem;
  font-family: 'Arial Rounded MT Pro', Arial, sans-serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: background 0.15s, transform 0.1s;
}
.dev-solve-btn:hover {
  background: var(--brand-dark);
  transform: translateY(-2px) scale(1.03);
}

/* Countdown overlay styling */
.countdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.countdown-text {
  font-size: 8rem;
  font-weight: bold;
  color: var(--brand);
  text-shadow: 0 0 20px rgba(61, 205, 87, 0.5);
  animation: countdownPulse 0.8s ease-in-out;
}

@keyframes countdownPulse {
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

/* Responsive countdown for mobile */
@media (max-width: 768px) {
  .countdown-text {
    font-size: 6rem;
  }
}

</style>

