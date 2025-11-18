<template>
  <!-- Completion dialog modal -->
  <div v-if="visible" class="completion-dialog-overlay">
    <div class="completion-dialog-modal">
      <!-- Congratulatory message -->
      <h2>Congratulations you have completed the game</h2>
      <!-- Time badge styled in yellow/gold -->
      <div class="time-badge">{{ formattedTime }}</div>
      <p>Sign up to win the special prize</p>
      <!-- Signup form -->
      <form @submit.prevent="onSubmit">
        <div class="form-group">
          <label for="name">Name</label>
          <input id="name" v-model="name" required />
        </div>
        <div class="form-group">
          <label for="email">E-mail</label>
          <input id="email" v-model="email" type="email" required />
        </div>
        <div class="form-group">
          <label for="phone">Phone</label>
          <input id="phone" v-model="phone" type="tel" required />
        </div>
        <!-- Consent checkboxes with links -->
        <div class="form-group consent-group">
          <label class="consent-label">
            <input type="checkbox" v-model="marketingConsent" required />
            I agree to receive marketing emails for a chance to win a special prize
            <a href="#" class="consent-link" @click.prevent="showMarketingDrawer = true">(Read more)</a>
          </label>
        </div>
        <div class="form-group consent-group">
          <label class="consent-label">
            <input type="checkbox" v-model="competitionConsent" required />
            I accept the competitive conditions
            <a href="#" class="consent-link" @click.prevent="showCompetitionDrawer = true">(Read more)</a>
          </label>
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
    <!-- Confetti canvas, only rendered when dialog is visible -->
    <canvas v-if="visible" ref="confettiCanvas" class="confetti-canvas"></canvas>
    <!-- Drawer dialogs for consent details -->
    <DrawerDialog :visible="showMarketingDrawer" @close="showMarketingDrawer = false">
      <div v-html="marketingText"></div>
    </DrawerDialog>
    <DrawerDialog :visible="showCompetitionDrawer" @close="showCompetitionDrawer = false">
      <div v-html="competitionText"></div>
    </DrawerDialog>
  </div>
</template>

<script setup>
// Props for dialog visibility and time
import { ref, defineProps, defineEmits, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import confetti from 'canvas-confetti'; // Import the confetti library
import DrawerDialog from './DrawerDialog.vue'; // Import the reusable drawer dialog

const props = defineProps({
  visible: Boolean,
  timeMs: Number // time in ms
});
const emit = defineEmits(['submit']);

const confettiCanvas = ref(null); // Ref for the confetti canvas

// Watch for dialog visibility to trigger confetti
watch(() => props.visible, async (newVal) => {
  if (newVal) {
    await nextTick(); // Wait for canvas to be in DOM
    if (confettiCanvas.value) {
      // Fire confetti using the custom canvas with a high z-index
      confetti.create(confettiCanvas.value, { resize: true, useWorker: true })({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }
});

// Format the time as mm:ss:cs
const formattedTime = computed(() => {
  const totalSeconds = Math.floor((props.timeMs || 0) / 1000);
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  const centiseconds = Math.floor(((props.timeMs || 0) % 1000) / 10).toString().padStart(2, '0');
  return `${minutes}:${seconds}:${centiseconds}`;
});

// Form state
const name = ref('');
const email = ref('');
const phone = ref('');

// Add consent state
const marketingConsent = ref(false);
const competitionConsent = ref(false);

// State for which drawer is open
const showMarketingDrawer = ref(false);
const showCompetitionDrawer = ref(false);

// Example content for each drawer (replace with your real text)
const marketingText = `
  <h3>Marketing Consent Details</h3> <br>
  <p>
    <h4>Introduction</h4>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam facilisis, urna at dictum cursus, enim urna dictum nisi, nec dictum enim urna at enim.
  </p>
  <h4>What You Consent To</h4>
  <p>
    - Receive promotional emails about our latest products and offers.<br>
    - Occasional surveys and feedback requests.<br>
    - You can unsubscribe at any time by clicking the link in our emails.
  </p>
  <h4>Data Usage</h4>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam nisl nunc eu nunc.
  </p>
  <h4>How We Use Your Data</h4>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, nisi eu consectetur consectetur, nisl nisl aliquam nunc, eget aliquam nisl nunc eu nunc. Etiam facilisis, urna at dictum cursus, enim urna dictum nisi, nec dictum enim urna at enim.
  </p>
  <h4>Third Party Sharing</h4>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam nisl nunc eu nunc. Pellentesque euismod, nisi eu consectetur consectetur, nisl nisl aliquam nunc, eget aliquam nisl nunc eu nunc.
  </p>
  <h4>Retention Policy</h4>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam facilisis, urna at dictum cursus, enim urna dictum nisi, nec dictum enim urna at enim. Mauris euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam nisl nunc eu nunc.
  </p>
  <h4>Your Rights</h4>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, nisi eu consectetur consectetur, nisl nisl aliquam nunc, eget aliquam nisl nunc eu nunc. Etiam facilisis, urna at dictum cursus, enim urna dictum nisi, nec dictum enim urna at enim. Mauris euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam nisl nunc eu nunc.
  </p>
  <h4>Contact Information</h4>
  <p>
    If you have any questions about our marketing consent policy, please contact us at info@example.com. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam facilisis, urna at dictum cursus, enim urna dictum nisi, nec dictum enim urna at enim.
  </p>
  <h4>Additional Information</h4>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, nisi eu consectetur consectetur, nisl nisl aliquam nunc, eget aliquam nisl nunc eu nunc. Etiam facilisis, urna at dictum cursus, enim urna dictum nisi, nec dictum enim urna at enim. Mauris euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam nisl nunc eu nunc. Pellentesque euismod, nisi eu consectetur consectetur, nisl nisl aliquam nunc, eget aliquam nisl nunc eu nunc.
  </p>
`;
const competitionText = `
  <h3>Competitive Conditions</h3> <br>
  <p>
    <h4>Eligibility</h4>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, nisi eu consectetur consectetur, nisl nisl aliquam nunc, eget aliquam nisl nunc eu nunc.
  </p>
  <h4>How to Participate</h4>
  <p>
    - Complete the sliding puzzle within the time limit.<br>
    - Submit your details in the form provided.<br>
    - Only one entry per person is allowed.
  </p>
  <h4>Prizes and Notification</h4>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam facilisis, urna at dictum cursus, enim urna dictum nisi, nec dictum enim urna at enim.
  </p>
  <h4>Other Terms</h4>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam nisl nunc eu nunc.
  </p>
`;

// Handle form submission
function onSubmit() {
  emit('submit', {
    name: name.value,
    email: email.value,
    phone: phone.value,
    marketingConsent: marketingConsent.value,
    competitionConsent: competitionConsent.value
  });
}
</script>

<style scoped>
/* Overlay for the modal */
.completion-dialog-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
/* Modal box styling */
.completion-dialog-modal {
  background: #fff;
  padding: 2rem 2.5rem;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.18);
  min-width: 320px;
  max-width: 90vw;
  text-align: center;
}
.completion-dialog-modal h2 {
  margin-bottom: 1rem;
  font-weight: 900;
  color: var(--dark);
}
.completion-dialog-modal p {
  margin-bottom: 1.5rem;
  color: #333;
}
.form-group {
  margin-bottom: 1.2rem;
  text-align: left;
}
.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.3rem;
}
.form-group input {
  width: 100%;
  padding: 0.6rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1rem;
}
button[type="submit"] {
  width: 100%;
  padding: 0.8rem;
  background: #008a15;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-family: 'Arial Rounded MT Pro', Arial, sans-serif;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background 0.15s;
}
button[type="submit"]:hover {
  background: #005e12;
}
/* Add styling for the time badge */
.time-badge {
  display: inline-block;
  background: linear-gradient(90deg, #ffe066 0%, #ffd700 100%);
  color: #7a5c00;
  font-weight: bold;
  font-size: 1.3rem;
  padding: 0.4rem 1.2rem;
  border-radius: 1.2rem;
  margin-bottom: 1.2rem;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.15);
  letter-spacing: 0.04em;
}
/* Add consent group styling */
.consent-group {
  margin-bottom: 0.7rem;
  font-size: 0.85rem;
  color: #444;
}
.consent-label {
  display: flex;
  align-items: center;
  font-weight: 600;
  gap: 0.6em;
}
.consent-label input[type="checkbox"] {
  margin: 0;
  accent-color: #008a15;
  width: 1rem;
}

.consent-group.form-group input[data-v-ea0eb02e] {
  width: 1rem
}
/* Confetti canvas styling: covers viewport, always on top */
.confetti-canvas {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  pointer-events: none;
  z-index: 3000;
}
.consent-link {
  color: #008a15;
  text-decoration: underline;
  font-size: 0.95em;
  margin-left: 0.5em;
  cursor: pointer;
  transition: color 0.15s;
}
.consent-link:hover {
  color: #005e12;
}
/* Drawer content text styling */

</style> 