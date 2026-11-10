import { onBeforeUnmount, onMounted } from 'vue'
import { isTextField } from '~/utils/focusable'
import { hasOpenModal } from '~/utils/modalStack'

export interface EditorHotkeys {
  undo: () => void
  redo: () => void
  save: () => void
}

export interface EditorHotkeysOptions {
  enabled?: () => boolean
  hasPendingInput?: () => boolean
}

export type HotkeyAction = keyof EditorHotkeys

export function matchHotkey(event: KeyboardEvent): HotkeyAction | null {
  if (!(event.ctrlKey || event.metaKey) || event.altKey) return null
  if (event.code === 'KeyZ') return event.shiftKey ? 'redo' : 'undo'
  if (event.code === 'KeyY' && !event.shiftKey) return 'redo'
  if (event.code === 'KeyS' && !event.shiftKey) return 'save'
  return null
}

function readValue(target: EventTarget | null): string | null {
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return target.value
  return null
}

export function useEditorHotkeys(handlers: EditorHotkeys, options: EditorHotkeysOptions = {}) {
  function shouldUseNativeUndo(event: KeyboardEvent): boolean {
    return isTextField(event.target)
      && readValue(event.target) !== null
      && (options.hasPendingInput?.() ?? false)
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented || event.isComposing || hasOpenModal.value) return
    if (options.enabled && !options.enabled()) return

    const action = matchHotkey(event)
    if (!action) return

    if (action !== 'save' && shouldUseNativeUndo(event)) {
      const target = event.target
      const before = readValue(target)
      setTimeout(() => {
        if (readValue(target) === before) handlers[action]()
      })
      return
    }

    event.preventDefault()
    handlers[action]()
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
}
