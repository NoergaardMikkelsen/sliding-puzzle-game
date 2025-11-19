<template>
  <!-- Sliding puzzle component - DK version -->
  <div class="sliding-puzzle">
    <!-- SE Logo at top center -->
    <img src="/images/dk_julekalender/SE_logo.png" alt="Schneider Electric" class="se-logo" />
    
    <!-- Layout elements: People at bottom center, products on left and right -->
    <div class="layout-people"></div>
    <div class="layout-products-left"></div>
    <div class="layout-products-right"></div>
    
    <!-- LK® One logo text overlay -->
    <div class="lk-one-logo">LK<sup class="registered-symbol">®</sup> One</div>
    
    <!-- Use the DK StartOverlay component -->
    <StartOverlayDK v-if="!gameStarted" @start-game="startGame" />

    <!-- Show endgame when solved -->
    <EndgameDK 
      v-else-if="showScoreboard"
      :time-ms="gaveUp ? 999999999 : timerMs"
      :gave-up="gaveUp"
      :day-number="selectedDay"
      @win-click="handleScoreboardWin"
    />
    
    <!-- Snowflakes for game page -->
    <Snowflake
      v-if="gameStarted && !showScoreboard"
      v-for="(snowflake, index) in snowflakes"
      :key="index"
      :size="snowflake.size"
      :start-position="snowflake.startPosition"
      :start-delay="snowflake.startDelay"
      :animation-duration="snowflake.duration"
    />
    
    <!-- Show puzzle grid, timer, and highscore if game has started -->
    <div v-if="gameStarted && !showScoreboard" class="puzzle-section">
      <!-- Game instruction -->
      <h2 class="game-instruction">
        <span class="instruction-line-1">Løs dagens puslespil</span>
        <span class="instruction-line-2">og vær med i LK<sup class="registered-symbol">®</sup> One konkurrencen</span>
      </h2>
      <!-- Modern styled timer with fixed width -->
      <div class="timer timer-fixed">{{ formattedTime }}</div>
      
      <!-- Timer-area primary action: before first round => Start; after at least one round => Starta om -->
      <button 
        v-if="gameStarted && !showScoreboard && !hasRoundStarted" 
        class="shuffle-btn"
        @click="readySetPlay"
      >
        Klar, parat, start!
      </button>
      <button 
        v-else-if="gameStarted && !showScoreboard && hasRoundStarted" 
        class="shuffle-btn"
        @click="openRestartConfirm"
      >
        Genstart spillet
      </button>
      <!-- Puzzle grid with absolute tiles -->
      <div class="puzzle-grid puzzle-absolute" ref="gridRef">
        <!-- Show puzzle tiles (solved state before game starts, shuffled after start button) -->
        <div
          v-for="(tile, visualIndex) in tiles"
          :key="tile.id"
          class="puzzle-tile"
          :class="{ empty: tile.isEmpty }"
          :ref="el => tileRefs[visualIndex] = el"
          @click="!showFullImage && moveTile(visualIndex)"
        >
          <img 
            v-if="tile.img" 
            :src="tile.img" 
            :alt="tile.isEmpty ? 'Empty tile' : 'Tile ' + tile.id"
            loading="eager"
            fetchpriority="high"
            :class="{ 'loaded': loadedImages.has(tile.img) }"
            @load="handleImageLoad"
            @error="handleImageError"
          />
        </div>
      </div>

      <!-- Give up button moved under puzzle grid -->
      <button 
        v-if="gameInProgress && !showScoreboard" 
        class="btn-giveup"
        @click="giveUp()"
      >
        Hjælp, jeg giver op!
      </button>
      
      <!-- Countdown overlay -->
      <div v-if="showCountdown" class="countdown-overlay">
        <div class="countdown-text">{{ countdownText }}</div>
      </div>
      <!-- Dev-only solved trigger removed for production -->
      <!-- Show the completion dialog modal when solved (keeping for now) -->
      <CompletionDialog
        :visible="isSolved && !showScoreboard"
        :time-ms="timerMs"
        @submit="handleDialogSubmit"
      />

      <!-- Confirm restart modal -->
      <ConfirmModalDK 
        :visible="showRestartConfirm"
        title="Er du sikker på, at du vil genstarte?"
        message="Du mister dine fremskridt fra denne runde."
        confirm-label="Genstart spillet"
        cancel-label="Tilbage til spillet"
        @confirm="confirmRestart"
        @cancel="cancelRestart"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import { useRouter, onBeforeRouteLeave } from 'vue-router';
import gsap from 'gsap';
import StartOverlayDK from './StartOverlayDK.vue';
import CompletionDialog from '../SE_spil/CompletionDialog.vue';
import EndgameDK from './EndgameDK.vue';
import ConfirmModalDK from './ConfirmModalDK.vue';
import Snowflake from './Snowflake.vue';

const router = useRouter();

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
const selectedDay = ref(null); // Track which door/day was selected
const imageFilenames = ref([]); // Will be populated based on selected day

// Generate snowflakes with different sizes and positions
const snowflakes = ref([]);
const snowflakeSizes = ['small', 'medium', 'large'];
const numberOfSnowflakes = 65; // Adjust this to control density

function generateSnowflakes() {
  const flakes = [];
  const minDistance = 2; // Minimum distance in percentage between snowflakes
  const positions = [];
  
  for (let i = 0; i < numberOfSnowflakes; i++) {
    let attempts = 0;
    let startPosition;
    let isValidPosition = false;
    
    // Try to find a position that's not too close to existing ones
    while (!isValidPosition && attempts < 50) {
      startPosition = Math.random() * 100;
      isValidPosition = positions.every(pos => Math.abs(pos - startPosition) >= minDistance);
      attempts++;
    }
    
    // If we couldn't find a good position after 50 attempts, just use the random one
    if (!isValidPosition) {
      startPosition = Math.random() * 100;
    }
    
    positions.push(startPosition);
    
    // Some snowflakes should already be visible when page loads
    // Distribute delays from -12 to 15 seconds so many are already falling
    const delay = -12 + (i / numberOfSnowflakes) * 27; // Spread from -12 to 15 seconds
    
    flakes.push({
      size: snowflakeSizes[Math.floor(Math.random() * snowflakeSizes.length)],
      startPosition: startPosition,
      startDelay: delay, // Evenly distributed delays so some are already falling
      duration: 15 // Same fall speed for all snowflakes
    });
  }
  snowflakes.value = flakes;
}

// Function to get image prefix based on day number
// Maps day numbers to the correct image prefix in door folders
// The image prefix doesn't always match the door number directly
// localStorage functions for tracking completed days
// TEMPORARILY DISABLED - localStorage saving is disabled
function markDayAsCompleted(dayNumber) {
  // TEMPORARILY DISABLED - Do nothing
  return;
  
  /* PRODUCTION CODE - Uncomment when ready to enable localStorage:
  try {
    const completedDays = getCompletedDays();
    if (!completedDays.includes(dayNumber)) {
      completedDays.push(dayNumber);
      localStorage.setItem('dk_julekalender_completed_days', JSON.stringify(completedDays));
    }
  } catch (e) {
    // localStorage might not be available, ignore
  }
  */
}

function getCompletedDays() {
  // TEMPORARILY DISABLED - Always return empty array
  return [];
  
  /* PRODUCTION CODE - Uncomment when ready to enable localStorage:
  try {
    const stored = localStorage.getItem('dk_julekalender_completed_days');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
  */
}


function getImagePrefix(dayNumber) {
  // Mapping between door numbers and image prefixes
  const dayToPrefixMap = {
    1: '01',
    2: '02',
    3: '03',
    4: '04',
    5: '05',
    8: '06',
    9: '07',
    10: '08',
    11: '09',
    12: '10',
    15: '11',
    16: '12',
    17: '13',
    18: '14',
    19: '15',
    22: '16',
    23: '17'
  };
  
  const prefix = dayToPrefixMap[dayNumber] || String(dayNumber).padStart(2, '0');
  return prefix;
}

// Function to generate image filenames based on selected day
function generateImageFilenames(dayNumber) {
  const prefix = getImagePrefix(dayNumber);
  const filenames = [];
  // Generate filenames for pieces 01-08 (skip 00 which is the full image)
  for (let i = 1; i <= 8; i++) {
    filenames.push(`${prefix}_${String(i).padStart(2, '0')}.jpg`);
  }
  return filenames;
}

const tiles = ref([]);
const isSolved = ref(false);
const gameStarted = ref(false);
const gameInProgress = ref(false);
const showScoreboard = ref(false);
const gaveUp = ref(false);
const showFullImage = ref(true); // Show full image before game starts
const tileRefs = ref([]); // Refs for each tile DOM element
const gridRef = ref(null); // Ref for the puzzle grid container DOM element

// Countdown state
const showCountdown = ref(false);
const countdownText = ref('');
const countdownInterval = ref(null);
// Track whether a round has ever started during this session
const hasRoundStarted = ref(false);
// Restart confirm modal state
const showRestartConfirm = ref(false);
let wasTimerRunningBeforeModal = false;

function openRestartConfirm() {
  // Pause timer while modal is open
  wasTimerRunningBeforeModal = !!timerInterval.value;
  stopTimer();
  showRestartConfirm.value = true;
}

function cancelRestart() {
  showRestartConfirm.value = false;
  // Resume timer if it was running
  if (wasTimerRunningBeforeModal && gameInProgress.value) {
    resumeTimer();
  }
}

function confirmRestart() {
  showRestartConfirm.value = false;
  // Full restart like starting a new game round
  gameInProgress.value = false;
  gaveUp.value = false;
  isSolved.value = false;
  showScoreboard.value = false;
  // Hide full image and show puzzle tiles
  showFullImage.value = false;
  // Initialize solved layout
  tiles.value = createTiles();
  // Position tiles in solved state first
  requestAnimationFrame(() => {
    const gridContainer = gridRef.value;
    if (gridContainer && tileRefs.value.length === tileCount) {
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
    }
    // Now shuffle tiles and start game
    shuffleTiles();
    // Wait for shuffle animation to complete before enabling game
    setTimeout(() => {
      gameInProgress.value = true;
      startTimer();
    }, 700); // Match the timing from startCountdown (500ms after GO!)
  });
}

// Loading state
const imagesLoaded = ref(false);
const loadingProgress = ref(0);

// Track loaded images to prevent blinking
const loadedImages = ref(new Set());

// Handle individual image load
function handleImageLoad(event) {
  const img = event.target;
  if (img && img.src) {
    const fullUrl = img.src;
    const relativePath = img.getAttribute('src') || img.src.split(window.location.origin)[1];
    loadedImages.value.add(fullUrl);
    if (relativePath) {
      loadedImages.value.add(relativePath);
    }
    // Add loaded class for fade-in effect
    img.classList.add('loaded');
  }
}

// Handle image error
function handleImageError(event) {
  const img = event.target;
  if (img && img.src) {
    // Mark as loaded even on error to prevent infinite waiting
    const relativePath = img.getAttribute('src') || img.src.split(window.location.origin)[1];
    loadedImages.value.add(img.src);
    if (relativePath) {
      loadedImages.value.add(relativePath);
    }
    img.classList.add('loaded');
  }
}

// Preload all images to prevent loading delays
async function preloadImages() {
  if (!selectedDay.value || imageFilenames.value.length === 0) return;
  
  // Reset loaded images set
  loadedImages.value.clear();
  
  const prefix = getImagePrefix(selectedDay.value);
  const activeDays = [1, 2, 3, 4, 5, 8, 9, 10, 11, 12, 15, 16, 17, 18, 19, 22, 23];
  const positionInSequence = activeDays.indexOf(selectedDay.value) + 1;
  let isDark;
  if (positionInSequence <= 10) {
    isDark = positionInSequence % 2 === 1;
  } else {
    isDark = positionInSequence % 2 === 0;
  }
  // Preload all puzzle piece images with full URL paths
  const imagePromises = imageFilenames.value.map((filename, index) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const imageUrl = `/images/dk_julekalender/door${selectedDay.value}/${filename}`;
      img.onload = () => {
        loadingProgress.value = Math.round(((index + 1) / (imageFilenames.value.length + 1)) * 100);
        // Store full URL including origin for matching
        const fullUrl = img.src;
        loadedImages.value.add(fullUrl);
        loadedImages.value.add(imageUrl); // Also store relative path
        resolve(img);
      };
      img.onerror = () => {
        // Even on error, mark as attempted to prevent infinite waiting
        loadedImages.value.add(imageUrl);
        resolve(null);
      };
      // Set src after event handlers to ensure they're attached
      img.src = imageUrl;
    });
  });
  
  try {
    await Promise.all([...imagePromises]);
    // Small delay to ensure browser has processed images
    await new Promise(resolve => setTimeout(resolve, 50));
    imagesLoaded.value = true;
  } catch (error) {
    console.error('Error preloading images:', error);
    // Still set as loaded to not block the game
    imagesLoaded.value = true;
  }
}

function createTiles() {
  if (!selectedDay.value || imageFilenames.value.length === 0) return [];
  
  const prefix = getImagePrefix(selectedDay.value);
  const arr = [];
  // Add the 8 image tiles first
  for (let i = 1; i < tileCount; i++) {
    arr.push({
      id: i,
      img: `/images/dk_julekalender/door${selectedDay.value}/${imageFilenames.value[i - 1]}`,
      isEmpty: false
    });
  }
  // Last tile: alternate between dark and light based on position in active days sequence
  // Active days: [1, 2, 3, 4, 5, 8, 9, 10, 11, 12, 15, 16, 17, 18, 19, 22, 23]
  // Pattern: positions 1-10 follow normal odd/even, but from position 11 (door 15) onwards, pattern flips
  const activeDays = [1, 2, 3, 4, 5, 8, 9, 10, 11, 12, 15, 16, 17, 18, 19, 22, 23];
  const positionInSequence = activeDays.indexOf(selectedDay.value) + 1; // 1-indexed position
  
  // For positions 1-10: odd = dark, even = light
  // For positions 11+: odd = light, even = dark (flipped)
  let isDark;
  if (positionInSequence <= 10) {
    isDark = positionInSequence % 2 === 1; // Odd positions = dark, even positions = light
  } else {
    isDark = positionInSequence % 2 === 0; // Odd positions = light, even positions = dark (flipped)
  }
  
  // Empty tile has no image - just black background
  arr.push({ id: 0, img: null, isEmpty: true });
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
  // This ensures the puzzle is always solvable since we only make legal moves
  let emptyIndex = arr.length - 1; // Empty tile starts at last position (bottom-right)
  let lastMovedTileIndex = -1; // Track the last moved tile position to avoid immediately reversing
  
  // Fixed number of moves for consistent difficulty
  const numMoves = 10;
  
  for (let i = 0; i < numMoves; i++) {
    const validAdjacentMoves = [];
    
    // Calculate empty tile's grid position
    const emptyRow = Math.floor(emptyIndex / size);
    const emptyCol = emptyIndex % size;
    
    // Find all valid adjacent tiles that can move into the empty space
    // We check each direction explicitly and verify adjacency
    
    // Left: same row, column - 1
    if (emptyCol > 0) {
      const leftIndex = emptyIndex - 1;
      const leftRow = Math.floor(leftIndex / size);
      const leftCol = leftIndex % size;
      // Verify: same row, adjacent column, and not the tile we just moved
      if (leftRow === emptyRow && leftCol === emptyCol - 1 && leftIndex !== lastMovedTileIndex) {
        validAdjacentMoves.push(leftIndex);
      }
    }
    
    // Right: same row, column + 1
    if (emptyCol < size - 1) {
      const rightIndex = emptyIndex + 1;
      const rightRow = Math.floor(rightIndex / size);
      const rightCol = rightIndex % size;
      // Verify: same row, adjacent column, and not the tile we just moved
      if (rightRow === emptyRow && rightCol === emptyCol + 1 && rightIndex !== lastMovedTileIndex) {
        validAdjacentMoves.push(rightIndex);
      }
    }
    
    // Up: row - 1, same column
    if (emptyRow > 0) {
      const upIndex = emptyIndex - size;
      const upRow = Math.floor(upIndex / size);
      const upCol = upIndex % size;
      // Verify: row above, same column, and not the tile we just moved
      if (upRow === emptyRow - 1 && upCol === emptyCol && upIndex !== lastMovedTileIndex) {
        validAdjacentMoves.push(upIndex);
      }
    }
    
    // Down: row + 1, same column
    if (emptyRow < size - 1) {
      const downIndex = emptyIndex + size;
      const downRow = Math.floor(downIndex / size);
      const downCol = downIndex % size;
      // Verify: row below, same column, and not the tile we just moved
      if (downRow === emptyRow + 1 && downCol === emptyCol && downIndex !== lastMovedTileIndex) {
        validAdjacentMoves.push(downIndex);
      }
    }
    
    // If no valid moves (shouldn't happen), allow any adjacent move
    if (validAdjacentMoves.length === 0) {
      // Fallback: allow any adjacent move
      if (emptyCol > 0) validAdjacentMoves.push(emptyIndex - 1);
      if (emptyCol < size - 1) validAdjacentMoves.push(emptyIndex + 1);
      if (emptyRow > 0) validAdjacentMoves.push(emptyIndex - size);
      if (emptyRow < size - 1) validAdjacentMoves.push(emptyIndex + size);
    }
    
    // Choose a random valid move
    if (validAdjacentMoves.length > 0) {
      const randomMoveIndex = validAdjacentMoves[Math.floor(Math.random() * validAdjacentMoves.length)];
      
      // Final safety check: ensure the move is valid
      const moveRow = Math.floor(randomMoveIndex / size);
      const moveCol = randomMoveIndex % size;
      const rowDiff = Math.abs(moveRow - emptyRow);
      const colDiff = Math.abs(moveCol - emptyCol);
      
      // Must be exactly one step away (adjacent)
      if (rowDiff + colDiff === 1 && randomMoveIndex >= 0 && randomMoveIndex < arr.length && !arr[randomMoveIndex].isEmpty) {
        // Perform the swap: tile at randomMoveIndex moves to emptyIndex, empty tile moves to randomMoveIndex
        const temp = arr[emptyIndex];
        arr[emptyIndex] = arr[randomMoveIndex];
        arr[randomMoveIndex] = temp;
        
        // Track which tile was moved (the one now at emptyIndex)
        lastMovedTileIndex = emptyIndex;
        // Update empty position
        emptyIndex = randomMoveIndex;
      } else {
        // Invalid move - this shouldn't happen, but skip if it does
        console.warn('Invalid move detected during shuffle, skipping');
        continue;
      }
    } else {
      // No valid moves available - this shouldn't happen
      console.warn('No valid moves available during shuffle');
      break;
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
    (clickedVisualIndex === emptyTileIndex + 1 && emptyTileIndex % size !== size - 1) || // Right (prevent wrap)
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
        // Mark this day as completed in localStorage
        if (selectedDay.value) {
          markDayAsCompleted(selectedDay.value);
        }
        // Log completed game when puzzle is solved
        try {
          if (import.meta.env.PROD && selectedDay.value) {
            const eventName = `DK_${selectedDay.value}completed_game`;
            const payload = JSON.stringify({ event: eventName });
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

async function startGame(dayNumber) {
  // Store the selected day number
  selectedDay.value = dayNumber;
  
  // Generate image filenames based on the selected day
  imageFilenames.value = generateImageFilenames(dayNumber);
  
  // Add history entry so back button goes to start screen, not to Swedish site
  window.history.pushState({ gameStarted: true, dayNumber }, '', '/dk_julekalender');
  
  gameStarted.value = true;
  gameInProgress.value = false;
  hasRoundStarted.value = false; // Reset round state when starting a new game
  showFullImage.value = true; // Show full image first
  resetTimer();
  
  // Preload images if not already loaded
  imagesLoaded.value = false;
  await preloadImages();
  
  // Initialize with solved state (no animation) - show tiles in solved state as preview
  tiles.value = createTiles();
  
  // Position tiles in solved state immediately so user can see the completed puzzle
  await nextTick();
  // Wait for DOM to be ready
  await nextTick();
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
      
      // Mark images as loaded if they were preloaded or already cached
      const img = domElement.querySelector('img');
      if (img) {
        // Check both full URL and relative path
        const imgSrc = img.src;
        const relativePath = tileData.img;
        if (loadedImages.value.has(imgSrc) || loadedImages.value.has(relativePath)) {
          img.classList.add('loaded');
        } else {
          // If image loads immediately (cached), mark as loaded
          if (img.complete && img.naturalHeight !== 0) {
            img.classList.add('loaded');
            loadedImages.value.add(imgSrc);
            loadedImages.value.add(relativePath);
          } else {
            // Wait a bit and check again for cached images
            setTimeout(() => {
              if (img.complete && img.naturalHeight !== 0 && !img.classList.contains('loaded')) {
                img.classList.add('loaded');
                loadedImages.value.add(imgSrc);
                loadedImages.value.add(relativePath);
              }
            }, 50);
          }
        }
      }
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
// Resume without resetting the current timer value
function resumeTimer() {
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
  // Mark this day as completed in localStorage
  if (selectedDay.value) {
    markDayAsCompleted(selectedDay.value);
  }
}

// Handle dialog form submission
function handleDialogSubmit(data) {
  // Production: no console noise
}

// Handle ready set play button click
function readySetPlay() {
  // Log start click to Vercel (fire-and-forget)
  try {
    if (import.meta.env.PROD && selectedDay.value) {
      const eventName = `DK_${selectedDay.value}start_click`;
      const payload = JSON.stringify({ event: eventName });
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/track', blob);
      } else {
        fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true });
      }
    }
  } catch (e) {}
  // Hide full image and show puzzle tiles in solved state
  showFullImage.value = false;
  // Position tiles in solved state
  requestAnimationFrame(() => {
    const gridContainer = gridRef.value;
    if (gridContainer && tileRefs.value.length === tileCount) {
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
    }
  });
  startCountdown();
  hasRoundStarted.value = true;
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
      // Shuffle tiles just before showing "GO!"
      shuffleTiles();
      countdownText.value = 'GO!';
      setTimeout(() => {
        showCountdown.value = false;
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
  // Mark this day as completed in localStorage (even if they gave up, they've been in the game)
  if (selectedDay.value) {
    markDayAsCompleted(selectedDay.value);
  }
  // Log give up click
  try {
    if (import.meta.env.PROD && selectedDay.value) {
      const eventName = `DK_${selectedDay.value}give_up_click`;
      const payload = JSON.stringify({ event: eventName });
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
    if (import.meta.env.PROD && selectedDay.value) {
      const eventName = `DK_${selectedDay.value}end_click`;
      const payload = JSON.stringify({ event: eventName });
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

// Prevent navigation away from DK page to Swedish site
onBeforeRouteLeave((to, from) => {
  // If trying to navigate to Swedish site (home page), prevent it
  if (to.path === '/') {
    // Reset game state if in game
    if (gameStarted.value) {
      gameStarted.value = false;
      gameInProgress.value = false;
      hasRoundStarted.value = false;
      showScoreboard.value = false;
      isSolved.value = false;
      gaveUp.value = false;
      showFullImage.value = true;
      resetTimer();
      selectedDay.value = null;
      tiles.value = [];
    }
    // Prevent navigation - stay on DK page
    return false;
  }
  // Allow navigation to other routes (if any)
  return true;
});

// Handle browser back button
function handlePopState(event) {
  // Check current path to prevent going back to Swedish site
  const currentPath = window.location.pathname;
  
  // If trying to navigate away from DK page, prevent it and stay on DK page
  if (currentPath !== '/dk_julekalender') {
    // Push current state back and redirect to DK page
    window.history.pushState({ dkPage: true, preventBack: true }, '', '/dk_julekalender');
    router.replace('/dk_julekalender');
    return;
  }
  
  // If we're going back and the state indicates we were in a game, reset to start screen
  if (gameStarted.value) {
    gameStarted.value = false;
    gameInProgress.value = false;
    hasRoundStarted.value = false; // Reset round state when going back
    showScoreboard.value = false;
    isSolved.value = false;
    gaveUp.value = false;
    showFullImage.value = true; // Reset to show full image
    resetTimer();
    selectedDay.value = null;
    tiles.value = [];
    
    // Replace state to prevent going back further
    window.history.replaceState({ dkPage: true }, '', '/dk_julekalender');
  } else {
    // If already on start screen and trying to go back, prevent navigation to Swedish site
    // Push a new state to stay on DK page
    window.history.pushState({ dkPage: true, preventBack: true }, '', '/dk_julekalender');
  }
}

// Watch for tiles changes and mark images as loaded if they're already cached
watch(tiles, async () => {
  await nextTick();
  // Check all images after a short delay to catch cached images
  setTimeout(() => {
    tileRefs.value.forEach((domElement) => {
      if (!domElement) return;
      const img = domElement.querySelector('img');
      if (img && !img.classList.contains('loaded')) {
        // If image is already loaded (cached), mark it
        if (img.complete && img.naturalHeight !== 0) {
          img.classList.add('loaded');
          const imgSrc = img.src;
          const relativePath = img.getAttribute('src');
          loadedImages.value.add(imgSrc);
          if (relativePath) {
            loadedImages.value.add(relativePath);
          }
        }
      }
    });
  }, 100);
}, { deep: true });

// Clean up countdown on unmount
onMounted(async () => {
  gameStarted.value = false;
  gameInProgress.value = false;
  hasRoundStarted.value = false; // Reset round state on mount
  resetTimer();
  // Generate snowflakes
  generateSnowflakes();
  
  // Replace current history entry to prevent going back to Swedish site
  window.history.replaceState({ dkPage: true }, '', '/dk_julekalender');
  
  // Add an extra history entry so back button stays on DK page
  // This ensures when user presses back, they go to this entry instead of Swedish site
  window.history.pushState({ dkPage: true, startScreen: true }, '', '/dk_julekalender');
  
  // Listen for back button
  window.addEventListener('popstate', handlePopState);
});

// Clean up countdown interval
onUnmounted(() => {
  if (countdownInterval.value) {
    clearTimeout(countdownInterval.value);
  }
  // Remove popstate listener
  window.removeEventListener('popstate', handlePopState);
});
</script>

<style scoped>

/* Sliding puzzle container */
.sliding-puzzle {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  min-height: 100svh; /* Match StartOverlayDK - use small viewport height */
  height: 100svh; /* Match StartOverlayDK - use small viewport height */
  overflow: hidden; /* Hide snowflakes that fall outside */
  background-color: var(--black);
  background-image: url('/images/dk_julekalender/layout/SE_Julekampagne_bg_desktop_2x.webp');
  background-size: cover;
  background-repeat: no-repeat;
}

/* Fallback for browsers that don't support svh */
@supports not (height: 1svh) {
  .sliding-puzzle {
    height: 100vh;
    min-height: 100vh;
  }
}

/* Mobile background image - up to 1024px */
@media (max-width: 1024px) {
  .sliding-puzzle {
    background-image: url('/images/dk_julekalender/layout/SE_Julekampagne_bg_mobile.webp');
  }
}

/* Layout elements: People and products */
.layout-people {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 900px; /* Reduced from 1200px to make it smaller */
  height: auto;
  aspect-ratio: 16 / 9;
  background-image: url('/images/dk_julekalender/layout/SE_Julekampagne_elektrikere_2x.webp');
  background-size: contain;
  background-position: center bottom;
  background-repeat: no-repeat;
  z-index: 1;
  pointer-events: none;
}

/* Responsive breakpoint for people image */
@media (max-width: 1500px) and (min-width: 1025px) {
  .layout-people {
    max-width: 600px;
    width: 50%;
  }
}

.layout-products-left {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(calc(-50% - 110%)); /* Position further left, more spacing from center */
  width: 20%;
  max-width: 350px;
  height: auto;
  aspect-ratio: 1 / 1;
  background-image: url('/images/dk_julekalender/layout/products_left_2x.webp');
  background-size: contain;
  background-position: center bottom;
  background-repeat: no-repeat;
  z-index: 2;
  pointer-events: none;
}

.layout-products-right {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(calc(-50% + 110%)); /* Position further right, more spacing from center */
  width: 20%;
  max-width: 350px;
  height: auto;
  aspect-ratio: 1 / 1;
  background-image: url('/images/dk_julekalender/layout/products_right_2x.webp');
  background-size: contain;
  background-position: center bottom;
  background-repeat: no-repeat;
  z-index: 2;
  pointer-events: none;
}

/* Responsive breakpoints for products */
@media (max-width: 1200px) {
  .layout-products-left {
    transform: translateX(calc(-50% - 120%));
    width: 30%;
    max-width: 300px;
  }
  
  .layout-products-right {
    transform: translateX(calc(-50% + 120%));
    width: 30%;
    max-width: 300px;
  }
}

@media (max-width: 1024px) {
  .layout-products-left {
    transform: translateX(calc(-50% - 120%));
    width: 30%;
    max-width: 300px;
  }
  
  .layout-products-right {
    transform: translateX(calc(-50% + 120%));
    width: 30%;
    max-width: 300px;
  }
}

@media (max-width: 768px) {
  .layout-products-left {
    transform: translateX(calc(-50% - 120%));
    width: 30%;
    max-width: 250px;
  }
  
  .layout-products-right {
    transform: translateX(calc(-50% + 120%));
    width: 30%;
    max-width: 250px;
  }
}

@media (max-width: 480px) {
  .layout-products-left {
    transform: translateX(calc(-50% - 120%));
    width: 30%;
    max-width: 200px;
  }
  
  .layout-products-right {
    transform: translateX(calc(-50% + 120%));
    width: 30%;
    max-width: 200px;
  }
}

/* LK® One logo text overlay */
.lk-one-logo {
  position: absolute;
  bottom: 6%;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Arial Black', Arial, sans-serif;
  font-weight: 800;
  font-size: clamp(2rem, 5vw, 4rem);
  color: #2a9d3f; /* Slightly lighter dark green color */
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15); /* Subtle shadow for better visibility */
  z-index: 2;
  pointer-events: none;
  text-align: center;
  white-space: nowrap;
}

.lk-one-logo .registered-symbol {
  font-size: 0.4em;
  vertical-align: super;
  line-height: 0;
  position: relative;
  top: -0.3em;
}

/* Responsive adjustments for LK® One logo */
@media (max-width: 1440px) and (min-width: 1025px) {
  .lk-one-logo {
    font-size: clamp(1.8rem, 4vw, 3.5rem);
    bottom: 8%;
  }
}

@media (max-width: 1024px) {
  .lk-one-logo {
    font-size: clamp(3rem, 10vw, 4rem);
    bottom: 8%;
  }
}

@media (max-width: 768px) {
  .lk-one-logo {
    font-size: clamp(3rem, 8vw, 4rem);
    bottom: 10%;
  }
}

@media (max-width: 480px) {
  .lk-one-logo {
    font-size: clamp(2rem, 3.5vw, 3rem);
    bottom: 6%;
  }
}

/* SE Logo at top center */
.se-logo {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  max-width: 130px;
  width: auto;
  height: auto;
  pointer-events: none;
}

/* --- Styles from puzzle.css (puzzle grid, timer, highscore, etc.) --- */

/* Layout for the main puzzle section */
.puzzle-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 1.25rem; /* single source of vertical spacing */
  width: 100%;
  position: relative;
  overflow: hidden; /* Hide snowflakes that fall outside */
  min-height: 100svh; /* Ensure minimum full viewport height */
  padding: 2rem 1rem;
  z-index: 3; /* Ensure content is above layout elements */
}

/* Fallback for browsers that don't support svh */
@supports not (height: 1svh) {
  .puzzle-section {
    min-height: 100vh;
  }
}

/* Game instruction styling */
.game-instruction {
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  max-width: 550px;
  padding: 0rem 1rem 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-family: 'Arial Rounded MT Pro', Arial, Helvetica, sans-serif;
  position: relative;
  z-index: 1; /* Ensure content is above snowflakes */
}

.instruction-line-1 {
  color: var(--brand); /* Green color */
  display: block;
  margin-top: 2.5rem;
}

.instruction-line-2 {
  color: var(--light); /* White color */
  display: block;
}

.registered-symbol {
  font-size: 0.5em;
  vertical-align: super;
  line-height: 0;
  position: relative;
  top: -0.3em;
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
  position: relative;
  z-index: 1; /* Ensure content is above snowflakes */
}

/* Puzzle grid container */
.puzzle-grid {
  margin: 0; /* rely on container gap */
  border: 1px solid var(--light);
  border-radius: 0;
  position: relative;
  z-index: 1; /* Ensure content is above snowflakes */
  padding: 0.5rem;
}

/* Give up button under puzzle */
.btn-giveup {
  margin: 0; /* rely on container gap */
  padding: 0.60rem 2rem;
  border: 1px solid var(--light);
  background: #000;
  color: var(--light);
  border-radius: 0.75rem;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: background 0.15s, transform 0.1s, border 0.15s;
  user-select: none;
  position: relative;
  z-index: 1; /* Ensure content is above snowflakes */
}
.btn-giveup:hover {
  transform: translateY(-2px) scale(1.03);
}

/* Container for absolutely positioned tiles in the puzzle grid */
.puzzle-absolute {
  position: relative;
  width: min(85vw, 30rem);
  height: min(85vw, 30rem);
  max-width: 30rem;
  max-height: 30rem;
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
  .instruction-line-1 {
    color: var(--brand); /* Green color */
    display: block;
    margin-top: 1.5rem;
 }
}
@media (max-width: 768px) {
  .se-logo {
    max-width: 140px;
  }
  
  .puzzle-section {
    padding-top: calc(env(safe-area-inset-top, 0px) + 4px);
    padding: 1rem 1rem;
    gap: 1rem; /* Reduced gap on mobile */
  }
  .puzzle-section > :first-child {
    margin-top: 0;
  }

  .puzzle-absolute {
    width: min(70vw, 20rem); /* Smaller on mobile */
    height: min(70vw, 20rem);
  }
  
  .game-instruction {
    font-size: 1.1rem; /* Smaller on mobile */
    max-width: 90vw;
    padding: 0 0.5rem;
  }
  
  .timer {
    font-size: 1.5rem; /* Smaller on mobile */
  }
  
  .shuffle-btn {
    padding: 0.6rem 1.5rem !important;
    font-size: 0.9rem !important; /* Smaller on mobile */
  }
  
  .btn-giveup {
    padding: 0.5rem 1.2rem;
    font-size: 0.85rem; /* Smaller on mobile */
  }
  
  .dev-solve-btn {
    padding: 0.4rem 1.2rem;
    font-size: 0.9rem;
  }
}
@media (max-width: 600px) {
  .sliding-puzzle {
    background-position: center 80%;
  }
  .se-logo {
    max-width: 100px;
  }
  .instruction-line-1 {
    margin-top: 0rem;
  }
}

/* Very small mobile */
@media (max-width: 480px) {
  .puzzle-absolute {
    width: min(65vw, 15rem) !important; /* Slightly larger for better usability */
    height: min(65vw, 15rem) !important;
    max-width: 15rem !important;
    max-height: 15rem !important;
  }
  
  .game-instruction {
    font-size: 1.1rem; /* Even smaller */
    max-width: 95vw;
  }

  .puzzle-section {
    margin-top: 3rem;
  }
  
  .timer {
    font-size: 1.3rem; /* Even smaller */
  }
  
  .shuffle-btn {
    padding: 0.55rem 1.3rem !important;
    font-size: 0.85rem !important;
  }
  
  .btn-giveup {
    padding: 0.45rem 1rem;
    font-size: 0.8rem;
  }
}

/* Tablet - Smaller tablets around 820px */
@media (min-width: 769px) and (max-width: 900px) {
  .se-logo {
    max-width: 160px;
  }
}

/* iPad and tablet size (769px-1024px) */
@media (min-width: 769px) and (max-width: 1024px) {
  .puzzle-section {
    margin-top: 2rem;
    padding-top: 3rem;
  }
  
  .puzzle-absolute {
    width: min(65vw, 32rem);
    height: min(65vw, 32rem);
    max-width: 32rem;
    max-height: 32rem;
  }
  
  .game-instruction {
    font-size: 2rem;
    max-width: 85vw;
  }
  
  .timer {
    font-size: 2.8rem;
  }
  
  .shuffle-btn {
    font-size: 1.5rem !important;
    padding: 0.9rem 2.5rem !important;
  }
  
  .btn-giveup {
    font-size: 1.2rem;
    padding: 0.75rem 2rem;
  }
}

/* Larger tablets (1025px-1200px) */
@media (min-width: 1025px) and (max-width: 1200px) {
  .puzzle-absolute {
    width: min(50vw, 30rem);
    height: min(50vw, 30rem);
    max-width: 30rem;
    max-height: 30rem;
  }
}

/* Tablet - Larger tablets */
@media (min-width: 901px) and (max-width: 1200px) {
  .se-logo {
    max-width: 180px;
  }
}

/* Smaller desktop (MacBook Air 13", etc.) */
@media (min-width: 1200px) and (max-width: 1600px) {
  .se-logo {
    max-width: 180px;
  }
  
  .puzzle-absolute {
    width: min(40vw, 24rem);
    height: min(40vw, 24rem);
    max-width: 24rem;
    max-height: 24rem;
  }
  
  .game-instruction {
    font-size: 1.7rem;
    max-width: 480px;
  }
  
  .timer {
    font-size: 2rem;
  }
  
  .shuffle-btn {
    font-size: 1rem !important;
    padding: 0.65rem 1.8rem !important;
  }
  
  .btn-giveup {
    font-size: 1rem;
    padding: 0.65rem 1.8rem;
  }
}

/* Larger desktop screens (1920px+, etc.) */
@media (min-width: 1600px) {
  .se-logo {
    max-width: 190px;
  }
  
  .puzzle-absolute {
    width: min(48vw, 28rem);
    height: min(48vw, 28rem);
  }
  
  .game-instruction {
    font-size: 1.9rem;
    max-width: 520px;
  }
  
  .timer {
    font-size: 2.3rem;
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
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.puzzle-tile img.loaded {
  opacity: 1;
}

/* Shuffle button styling */
.shuffle-btn {
  margin: 0; /* rely on container gap */
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
  position: relative;
  z-index: 1; /* Ensure content is above snowflakes */
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
  .puzzle-section {
  gap: 1rem; /* single source of vertical spacing */
}
.btn-giveup {
  padding: 0.60rem 1.5rem;
  font-size: 1rem;
}
}

</style>
