<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="modelValue" class="overlay" @mousedown.self="$emit('update:modelValue', false)">
        <div class="modal" :class="`modal--${size ?? 'md'}`" role="dialog" :aria-label="title">
          <div class="modal-header">
            <h3 class="modal-title">{{ title }}</h3>
            <button type="button" class="close-btn" @click="$emit('update:modelValue', false)">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              </svg>
            </button>
          </div>
          <div class="modal-body"><slot /></div>
          <div class="modal-footer">
            <slot name="footer">
              <button type="button" class="btn btn-ghost" @click="$emit('update:modelValue', false)">ยกเลิก</button>
              <button type="button" class="btn btn-primary" @click="$emit('confirm')">
                {{ confirmLabel ?? 'บันทึก' }}
              </button>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  title: string
  size?: 'sm' | 'md' | 'lg'
  confirmLabel?: string
}>()

defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'confirm'): void
}>()
</script>

<style scoped>
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.45); backdrop-filter: blur(2px);
  z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal { background: #fff; border-radius: 14px; box-shadow: 0 20px 60px rgba(0,0,0,.18); display: flex; flex-direction: column; max-height: 90vh; overflow: hidden; width: 100%; }
.modal--sm { max-width: 400px; }
.modal--md { max-width: 560px; }
.modal--lg { max-width: 740px; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 16px; border-bottom: 1px solid #f1f3f4; flex-shrink: 0; }
.modal-title { font-size: 1rem; font-weight: 700; color: #111827; margin: 0; }
.close-btn { background: none; border: none; cursor: pointer; padding: 4px; border-radius: 6px; color: #9ca3af; display: flex; align-items: center; transition: background 0.1s, color 0.1s; }
.close-btn:hover { background: #f3f4f6; color: #374151; }
.modal-body { padding: 20px 24px; overflow-y: auto; flex: 1; }
.modal-footer { padding: 16px 24px; border-top: 1px solid #f1f3f4; display: flex; justify-content: flex-end; gap: 8px; flex-shrink: 0; }
.btn { display: inline-flex; align-items: center; gap: 6px; border-radius: 8px; padding: 8px 18px; font-size: 0.875rem; font-weight: 500; cursor: pointer; border: 1px solid transparent; font-family: inherit; transition: background 0.12s; }
.btn-ghost { background: #fff; color: #374151; border-color: #e5e7eb; }
.btn-ghost:hover { background: #f9fafb; }
.btn-primary { background: #16a34a; color: #fff; border-color: #16a34a; }
.btn-primary:hover { background: #15803d; }
.overlay-enter-active, .overlay-leave-active { transition: opacity 0.18s; }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }
</style>
