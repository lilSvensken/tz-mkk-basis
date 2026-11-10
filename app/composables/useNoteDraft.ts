import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue'
import type { NoteContent } from '~/types/note'
import { removeDraft, saveDraft } from '~/utils/drafts'
import { cloneContent } from '~/utils/noteContent'

export const DRAFT_DELAY = 500

export function useNoteDraft(noteId: string, content: NoteContent, isDirty: Ref<boolean>) {
  let timer: ReturnType<typeof setTimeout> | null = null
  let stopped = false

  function clearTimer() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  function write() {
    clearTimer()
    if (stopped) return
    if (isDirty.value) saveDraft(noteId, cloneContent(content))
    else removeDraft(noteId)
  }

  function flush() {
    if (timer) write()
  }

  function discard() {
    clearTimer()
    removeDraft(noteId)
  }

  function stop() {
    stopped = true
    discard()
  }

  function onVisibilityChange() {
    if (document.visibilityState === 'hidden') flush()
  }

  watch(() => JSON.stringify(content), () => {
    clearTimer()
    timer = setTimeout(write, DRAFT_DELAY)
  })

  onMounted(() => {
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', onVisibilityChange)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('pagehide', flush)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    stop()
  })

  return { discard, stop }
}
