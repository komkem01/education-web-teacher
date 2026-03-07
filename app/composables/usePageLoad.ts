import { ref } from 'vue'

export function usePageLoad(delay = 600) {
  const loading = ref(true)
  if (import.meta.client) {
    setTimeout(() => { loading.value = false }, delay)
  } else {
    loading.value = false
  }
  return { loading }
}
