<template>
  <!-- Drawer dialog slides up from the bottom, and slides down when closing -->
  <div v-if="visible || isAnimating" class="drawer-overlay" @click.self="handleClose">
    <div class="drawer-content" :class="{ closing: isClosing }">
      <button class="drawer-close" @click="handleClose">&times;</button>
      <!-- Slot for custom content -->
      <slot />
    </div>
  </div>
</template>

<script setup>
// Props for controlling visibility
import { ref, watch } from 'vue';
const props = defineProps({
  visible: Boolean
});
const emit = defineEmits(['close']);

// Local state for animation
const isClosing = ref(false);
const isAnimating = ref(false);

// Watch for open/close
watch(() => props.visible, (val) => {
  if (val) {
    isAnimating.value = true;
    isClosing.value = false;
  } else if (!val && isAnimating.value) {
    // If parent sets visible to false, animate out
    isClosing.value = true;
    setTimeout(() => {
      isAnimating.value = false;
    }, 350);
  }
});

// Handle close button or overlay click
function handleClose() {
  isClosing.value = true;
  setTimeout(() => {
    isAnimating.value = false;
    emit('close');
  }, 350); // Match animation duration
}
</script>

<style scoped>

.drawer-overlay {
  position: fixed;
  left: 0; right: 0; bottom: 0; top: 0;
  background: rgba(0,0,0,0.25);
  z-index: 4000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  transition: background 0.2s;
}
.drawer-content {
  background: #fff;
  width: 100%;
  max-width: calc(100% - 1rem);
  min-height: calc(100% - 1rem);
  border-radius: 0.25rem 0.25rem 0 0;
  box-shadow: 0 -4px 24px rgba(0,0,0,0.18);
  padding: 4rem 1.5rem 2.5rem 1.5rem;
  margin-bottom: 0;
  animation: slideUpDrawer 0.55s cubic-bezier(0.4,0.2,0.2,1);
  position: relative;
  text-align: left;
  overflow-y: auto;
  max-height: 90vh;
}
.drawer-content.closing {
  animation: slideDownDrawer 0.55s cubic-bezier(0.4,0.2,0.2,1) forwards;
}
@keyframes slideUpDrawer {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
@keyframes slideDownDrawer {
  from { transform: translateY(0); }
  to { transform: translateY(100%); }
}
.drawer-close {
  background: none;
  border: none;
  font-size: 2rem;
  color: #aaa;
  cursor: pointer;
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  transition: color 0.15s;
}
.drawer-close:hover {
  color: #008a15;
}


.drawer-content h2,
.drawer-content h3,
.drawer-content h4 {
  margin-bottom: 2rem;
}

.drawer-content h3,
.drawer-content h4 {
  text-align: left;
  margin-top: 0;
  margin-bottom: 0.7em;
}
.drawer-content h3 {
  font-size: 1.25rem;
  font-weight: 800;
  color: #008a15;
}
.drawer-content h4 {
  font-size: 1.08rem;
  font-weight: 700;
  color: #005e12;
}
.drawer-content p {
  text-align: left;
  margin-top: 0;
  margin-bottom: 1em;
  color: #333;
  font-size: 1rem;
  line-height: 1.6;
}
</style> 