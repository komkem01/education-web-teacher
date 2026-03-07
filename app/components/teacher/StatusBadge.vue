<template>
  <span class="badge" :class="variantClass">{{ label }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'pending'
}>()

const variantClass = computed(() => `badge--${props.variant ?? 'neutral'}`)
</script>

<style scoped>
.badge { display: inline-flex; align-items: center; padding: 2px 9px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; white-space: nowrap; }
.badge--success { background: #f0fdf4; color: #16a34a; }
.badge--warning { background: #fffbeb; color: #d97706; }
.badge--danger  { background: #fef2f2; color: #dc2626; }
.badge--info    { background: #eff6ff; color: #1d4ed8; }
.badge--neutral { background: #f3f4f6; color: #6b7280; }
.badge--pending { background: #fef9c3; color: #92400e; }
</style>
