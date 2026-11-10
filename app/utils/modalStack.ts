import { computed, shallowRef } from 'vue'

const stack = shallowRef<symbol[]>([])

export const hasOpenModal = computed(() => stack.value.length > 0)

function syncScrollLock() {
  if (typeof document === 'undefined') return
  document.body.style.overflow = stack.value.length > 0 ? 'hidden' : ''
}

export function pushModal(token: symbol) {
  if (stack.value.includes(token)) return
  stack.value = [...stack.value, token]
  syncScrollLock()
}

export function removeModal(token: symbol) {
  if (!stack.value.includes(token)) return
  stack.value = stack.value.filter(item => item !== token)
  syncScrollLock()
}

export function isTopModal(token: symbol): boolean {
  return stack.value[stack.value.length - 1] === token
}
