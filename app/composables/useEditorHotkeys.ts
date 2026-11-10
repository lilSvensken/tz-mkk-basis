import { onBeforeUnmount, onMounted } from 'vue'
import { hasOpenModal } from '~/utils/modalStack'

export interface EditorHotkeys {
  undo: () => void
  redo: () => void
  save: () => void
}

export type HotkeyAction = keyof EditorHotkeys

export function matchHotkey(event: KeyboardEvent): HotkeyAction | null {
  if (!(event.ctrlKey || event.metaKey) || event.altKey) return null
  if (event.code === 'KeyZ') return event.shiftKey ? 'redo' : 'undo'
  if (event.code === 'KeyY' && !event.shiftKey) return 'redo'
  if (event.code === 'KeyS' && !event.shiftKey) return 'save'
  return null
}

export function useEditorHotkeys(handlers: EditorHotkeys, enabled: () => boolean = () => true) {
  function onKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented || event.isComposing || hasOpenModal.value || !enabled()) return
    const action = matchHotkey(event)
    if (!action) return
    event.preventDefault()
    handlers[action]()
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
}
