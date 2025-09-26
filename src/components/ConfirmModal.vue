<template>
  <div v-if="visible" class="confirm-overlay" @keydown.esc.prevent="onCancel" tabindex="-1">
    <div class="confirm-modal" role="dialog" aria-modal="true" :aria-labelledby="titleId" :aria-describedby="descId">
      <h3 :id="titleId" class="confirm-title">{{ title }}</h3>
      <p :id="descId" class="confirm-message">{{ message }}</p>
      <div class="confirm-actions">
        <button class="btn btn-secondary" type="button" @click="onCancel" :disabled="disabled">{{ cancelLabel }}</button>
        <button class="btn btn-primary" type="button" @click="onConfirm" :disabled="disabled">{{ confirmLabel }}</button>
      </div>
    </div>
  </div>
  
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: 'Bekräfta' },
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: 'Starta om' },
  cancelLabel: { type: String, default: 'Avbryt' },
  disabled: { type: Boolean, default: false }
});

const emit = defineEmits(['confirm', 'cancel']);

const titleId = computed(() => 'confirm-title');
const descId = computed(() => 'confirm-desc');

function onConfirm() {
  emit('confirm');
}

function onCancel() {
  emit('cancel');
}
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.confirm-modal {
  background: #000;
  color: var(--light);
  width: min(92vw, 560px);
  border-radius: 16px;
  box-shadow: 0 28px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.06) inset;
  border: 1px solid rgba(255, 255, 255, 0.20);
  padding: 3rem 2.5rem 3rem 2.5rem;
  text-align: left;
  animation: modalIn 160ms cubic-bezier(0.2, 0.9, 0.3, 1);
}
.confirm-title {
  margin: 0 0 1rem 0;
  font-family: 'Arial Rounded MT Pro', Arial, sans-serif;
  font-weight: 800;
  font-size: 1.35rem;
  letter-spacing: -0.05em;
  color: var(--light);
}
.confirm-message {
  margin: 0 0 2.5rem 0;
  color: rgba(255,255,255,0.86);
  line-height: 1.6;
}
.confirm-actions {
  display: flex;
  gap: 0.8rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

@keyframes modalIn {
  from { transform: scale(0.98); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .confirm-modal {
    width: min(95vw, 400px);
    padding: 2rem 1.5rem 1.5rem 1.5rem;
    margin: 1rem;
  }
  
  .confirm-title {
    font-size: 1.2rem;
    margin-bottom: 0.75rem;
  }
  
  .confirm-message {
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
    line-height: 1.5;
  }
  
  .confirm-actions {
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 0.75rem;
  }
  
  .btn {
    width: 100%;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .confirm-modal {
    width: calc(100vw - 2rem);
    padding: 1.5rem 1.25rem 1.25rem 1.25rem;
    margin: 0.5rem;
  }
  
  .confirm-title {
    font-size: 1.1rem;
  }
  
  .confirm-message {
    font-size: 0.9rem;
  }
}
.btn {
  padding: 0.60rem 2rem;
  border-radius: 0.75rem;
  font-family: 'Arial Rounded MT Pro', Arial, sans-serif;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  border: 1px solid transparent;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: background 0.15s, color 0.15s, border-color 0.15s, transform 0.1s;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-primary {
  background: var(--brand);
  color: var(--light);
  border-color: var(--brand);
}
.btn-primary:hover {
  background: var(--brand-dark);
  transform: translateY(-2px) scale(1.03);
}
.btn-secondary {
  background: #000;
  color: #fff;
  border-color: rgba(255,255,255,0.9);
}
.btn-secondary:hover {
  transform: translateY(-2px) scale(1.03);
}
</style>


