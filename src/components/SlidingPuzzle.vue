<template>
  <!-- Sliding puzzle component -->
  <div class="sliding-puzzle">
    <!-- Use the new StartOverlay component, conditionally rendered -->
    <StartOverlay v-if="!gameStarted" @start-game="startGame" />

    <!-- Show puzzle grid, timer, and highscore if game has started -->
    <div v-else class="puzzle-section">
      <!-- Modern styled timer with fixed width -->
      <div class="timer timer-fixed">Time: {{ formattedTime }}</div>
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
      <!-- Shuffle button -->
      <button class="shuffle-btn" @click="shuffleTiles">Shuffle</button>
      <!-- Temporary button to trigger solved state for modal testing -->
      <button class="dev-solve-btn" @click="triggerSolved">Trigger Solved (Dev Only)</button>
      <!-- Show the completion dialog modal when solved -->
      <CompletionDialog
        :visible="isSolved"
        :time-ms="timerMs"
        @submit="handleDialogSubmit"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import gsap from 'gsap';
import StartOverlay from './StartOverlay.vue'; // Import the new component
import CompletionDialog from './CompletionDialog.vue'; // Import the completion dialog
// Note: animateTilePop is not used for sliding, but can be kept if you want to use it elsewhere or switch back.
// import { animateTilePop } from '../gsapTileAnimation'; 

// Timer state in ms
const timerMs = ref(0);
const timerInterval = ref(null);
const timer = computed(() => Math.floor(timerMs.value / 1000));
const milliseconds = computed(() => Math.floor((timerMs.value % 1000) / 10));
const formattedTime = computed(() => `${timer.value}s ${milliseconds.value.toString().padStart(2, '0')}`);

// Puzzle grid and tile state
const size = 3;
const tileCount = size * size;
const imageFilenames = [
  'puzz_piece_1.png',
  'puzz_piece_2.png',
  'puzz_piece_3.png',
  'puzz_piece_4.png',
  'puzz_piece_5.png',
  'puzz_piece_6.png',
  'puzz_piece_7.png',
  'puzz_piece_8.png'
];
const tiles = ref([]);
const isSolved = ref(false);
const gameStarted = ref(false);
const tileRefs = ref([]); // Refs for each tile DOM element
const gridRef = ref(null); // Ref for the puzzle grid container DOM element

function createTiles() {
  const arr = [];
  for (let i = 1; i < tileCount; i++) {
    arr.push({
      id: i,
      img: `/images/${imageFilenames[i - 1]}`,
      isEmpty: false
    });
  }
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
      duration: 0.35, 
      ease: 'power2.inOut',
    });
  });
}

function shuffleTiles() {
  const arr = createTiles();
  do {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  } while (isSolvedArr(arr));
  tiles.value = arr;
  isSolved.value = false;
  resetTimer();
  // Wait for Vue to update the DOM then animate tiles to their initial shuffled positions
  nextTick(() => animateAllTiles()); 
}

function isSolvedArr(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i].id !== i + 1) return false;
  }
  return arr[arr.length - 1].isEmpty;
}

async function moveTile(clickedVisualIndex) {
  if (!gameStarted.value || isSolved.value) return;
  const emptyTileIndex = tiles.value.findIndex(t => t.isEmpty);

  const canMove =
    (clickedVisualIndex === emptyTileIndex - 1 && emptyTileIndex % size !== 0) || // Left
    (clickedVisualIndex === emptyTileIndex + 1 && clickedVisualIndex % size !== 0) || // Right
    clickedVisualIndex === emptyTileIndex - size || // Up
    clickedVisualIndex === emptyTileIndex + size;    // Down

  if (canMove) {
    // Swap tiles in the data array
    [tiles.value[clickedVisualIndex], tiles.value[emptyTileIndex]] = [tiles.value[emptyTileIndex], tiles.value[clickedVisualIndex]];
    
    // Wait for Vue to re-render the v-for list (DOM elements might be re-used/re-ordered)
    await nextTick(); 
    // Animate all tiles to reflect their new positions in the array
    animateAllTiles(); 

    isSolved.value = isSolvedArr(tiles.value);
    if (isSolved.value) stopTimer();
  }
}

function startGame() {
  shuffleTiles();
  gameStarted.value = true;
  startTimer();
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

// Watch for changes in the tiles array to re-animate positions
// This is useful if tiles array is manipulated externally or for initial setup
watch(tiles, () => {
  nextTick(() => animateAllTiles());
}, { deep: true }); // deep watch might be overkill, but ensures reactivity if tile objects themselves change

function triggerSolved() {
  isSolved.value = true;
  stopTimer();
}

// Handle dialog form submission
function handleDialogSubmit(data) {
  // For now, just log the data. You can add your own logic here.
  console.log('Dialog form submitted:', data);
}

onMounted(() => {
  tiles.value = createTiles(); // Initialize with solved state first
  gameStarted.value = false;
  resetTimer();
  // Animate tiles to their initial (solved) positions
  nextTick(() => animateAllTiles()); 
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

/* Timer display styling */
.timer {
  background: var(--light);
  color: var(--brand-dark);
  font-size: 1.3rem;
  font-weight: 600;
  padding: 0.7rem 2.5rem;
  border-radius: var(--border);
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  margin-bottom: 1.2rem;
  letter-spacing: 0.03em;
  display: inline-block;
  user-select: none;
}

/* Puzzle grid container */
.puzzle-grid {
  margin-bottom: 0.5rem;
}

/* Container for absolutely positioned tiles in the puzzle grid */
.puzzle-absolute {
  position: relative;
  width: min(85vw, 30rem);
  height: min(85vw, 30rem);
  max-width: 30rem;
  max-height: 30rem;
  margin-bottom: 1.5rem;
}

/* Individual puzzle tile styling */
.puzzle-tile {
  position: absolute; /* Crucial for GSAP positioning */
  top: 0; /* Initial position, GSAP will animate x/y */
  left: 0; /* Initial position, GSAP will animate x/y */
  background: var(--light);
  border-radius: var(--radius);
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
}
.puzzle-tile:hover:not(.empty) {
  box-shadow: 0 4px 20px rgba(61,205,87,0.18);
  border-color: var(--brand);
  transform: scale(1.04); 
}
.puzzle-tile.empty {
  background: var(--light);
  cursor: default;
  border: 1px dashed #e0e0e000;
}
.puzzle-tile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Shuffle button styling */
.shuffle-btn {
  margin-top: 0.5rem;
  padding: 0.7rem 2.2rem;
  border: none;
  background: var(--light);
  color: var(--dark);
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: background 0.15s, transform 0.1s;
  user-select: none;
}
.shuffle-btn:hover {
  transform: translateY(-2px) scale(1.03);
}

/* Temporary button styling */
.dev-solve-btn {
  margin-top: 0.5rem;
  padding: 0.5rem 1.5rem;
  background: #ffb300;
  color: #222;
  border: none;
  border-radius: 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: background 0.15s, transform 0.1s;
}
.dev-solve-btn:hover {
  background: #ffcb42;
  transform: translateY(-2px) scale(1.03);
}

</style>

