<template>
  <!-- Completion dialog component -->
  <div class="completion-dialog" v-if="visible">
    <div class="dialog-content">
      <h2>Congratulations!</h2>
      <!-- Show user's time and placement -->
      <p>Your time: <strong>{{ time }}</strong></p>
      <p>Your placement: <strong>{{ placement }}</strong></p>
      <!-- Form for name, email, and consents -->
      <form @submit.prevent="onSubmit">
        <div>
          <label>Name:</label>
          <input v-model="name" required />
        </div>
        <div>
          <label>Email:</label>
          <input v-model="email" type="email" required />
        </div>
        <div>
          <label>
            <input type="checkbox" v-model="competitionConsent" required />
            I give consent to participate in the competition
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" v-model="marketingConsent" />
            I agree to receive marketing emails for a chance to win a company party
          </label>
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  </div>
</template>

<script setup>
// This component shows a dialog when the puzzle is completed
// and collects user info and consents
import { ref, defineProps, defineEmits } from 'vue';

// Props for dialog visibility, time, and placement
const props = defineProps({
  visible: Boolean,
  time: String,
  placement: Number
});

// Emits event when form is submitted
const emit = defineEmits(['submit']);

// Form state
const name = ref('');
const email = ref('');
const competitionConsent = ref(false);
const marketingConsent = ref(false);

// Handle form submission
function onSubmit() {
  emit('submit', {
    name: name.value,
    email: email.value,
    competitionConsent: competitionConsent.value,
    marketingConsent: marketingConsent.value
  });
}
</script>

<style scoped>
.completion-dialog {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.dialog-content {
  background: #fff;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.15);
  min-width: 320px;
}
form > div {
  margin-bottom: 1rem;
  text-align: left;
}
button[type="submit"] {
  width: 100%;
  padding: 0.7rem;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
}
button[type="submit"]:hover {
  background: #0056b3;
}
</style> 