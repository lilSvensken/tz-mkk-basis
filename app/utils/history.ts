import { computed, shallowRef } from 'vue'

export const HISTORY_LIMIT = 50

export function createHistory<P>(invert: (patch: P) => P, limit = HISTORY_LIMIT) {
  const past = shallowRef<P[]>([])
  const future = shallowRef<P[]>([])

  const canUndo = computed(() => past.value.length > 0)
  const canRedo = computed(() => future.value.length > 0)

  function push(patch: P) {
    const next = [...past.value, patch]
    if (next.length > limit) next.splice(0, next.length - limit)
    past.value = next
    if (future.value.length > 0) future.value = []
  }

  function undo(): P | undefined {
    const patch = past.value[past.value.length - 1]
    if (patch === undefined) return undefined
    past.value = past.value.slice(0, -1)
    future.value = [...future.value, patch]
    return invert(patch)
  }

  function redo(): P | undefined {
    const patch = future.value[future.value.length - 1]
    if (patch === undefined) return undefined
    future.value = future.value.slice(0, -1)
    past.value = [...past.value, patch]
    return patch
  }

  function reset() {
    past.value = []
    future.value = []
  }

  return {
    past,
    future,
    canUndo,
    canRedo,
    push,
    undo,
    redo,
    reset,
  }
}

export type History<P> = ReturnType<typeof createHistory<P>>
