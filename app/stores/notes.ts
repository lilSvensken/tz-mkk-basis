import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Note, NoteContent } from '~/types/note'
import { createId } from '~/utils/id'
import { normalizeContent } from '~/utils/noteContent'
import { loadNotes, NOTES_STORAGE_KEY, saveNotes } from '~/utils/notesStorage'

export const SAVE_DELAY = 300

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])
  const loaded = ref(false)

  let saveTimer: ReturnType<typeof setTimeout> | null = null
  let dirty = false
  let listening = false

  const sortedNotes = computed(() =>
    [...notes.value].sort((a, b) => b.updatedAt - a.updatedAt),
  )

  function load() {
    notes.value = loadNotes()
    loaded.value = true
  }

  function getById(id: string): Note | undefined {
    return notes.value.find(note => note.id === id)
  }

  function flush() {
    if (saveTimer) {
      clearTimeout(saveTimer)
      saveTimer = null
    }
    if (!dirty) return
    dirty = false
    saveNotes(notes.value)
  }

  function scheduleSave() {
    dirty = true
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(flush, SAVE_DELAY)
  }

  function create(content: NoteContent): Note {
    const now = Date.now()
    notes.value.push({
      id: createId(),
      ...normalizeContent(content),
      createdAt: now,
      updatedAt: now,
    })
    scheduleSave()
    return notes.value[notes.value.length - 1]!
  }

  function update(id: string, content: NoteContent): Note | undefined {
    const note = getById(id)
    if (!note) return undefined
    Object.assign(note, normalizeContent(content), { updatedAt: Date.now() })
    scheduleSave()
    return note
  }

  function remove(id: string): boolean {
    const index = notes.value.findIndex(note => note.id === id)
    if (index === -1) return false
    notes.value.splice(index, 1)
    scheduleSave()
    return true
  }

  function onVisibilityChange() {
    if (document.visibilityState === 'hidden') flush()
  }

  function onStorage(event: StorageEvent) {
    if (event.key !== null && event.key !== NOTES_STORAGE_KEY) return
    if (saveTimer) {
      clearTimeout(saveTimer)
      saveTimer = null
    }
    dirty = false
    load()
  }

  function init() {
    if (!loaded.value) load()
    if (listening || typeof window === 'undefined') return
    listening = true
    window.addEventListener('pagehide', flush)
    window.addEventListener('storage', onStorage)
    document.addEventListener('visibilitychange', onVisibilityChange)
  }

  function dispose() {
    flush()
    if (!listening) return
    listening = false
    window.removeEventListener('pagehide', flush)
    window.removeEventListener('storage', onStorage)
    document.removeEventListener('visibilitychange', onVisibilityChange)
  }

  return {
    notes,
    loaded,
    sortedNotes,
    load,
    init,
    dispose,
    getById,
    create,
    update,
    remove,
    flush,
  }
})
