<template>
  <!-- Leaderboard component -->
  <div class="leaderboard">
    <!-- Highscore list will be implemented here -->
    <div class="leaderboard-placeholder">[Highscore leaderboard]</div>
  </div>
</template>

<script setup>
// This component will handle fetching and displaying the highscore leaderboard
import { supabase } from '../supabaseClient';

// Function to fetch highscores from Supabase (to be implemented)
async function fetchHighscores() {
  // TODO: Fetch highscores from Supabase
}
</script>

<style scoped>
.leaderboard {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.leaderboard-placeholder {
  width: 90vw;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eee;
  border-radius: 8px;
  color: #bbb;
  font-size: 1.2rem;
}
</style> 