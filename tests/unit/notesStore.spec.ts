import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SAVE_DELAY, useNotesStore } from '~/stores/notes'
import type { NoteContent } from '~/types/note'
import { loadNotes, NOTES_STORAGE_KEY, saveNotes } from '~/utils/notesStorage'

const content: NoteContent = {
  title: 'Покупки',
  todos: [{ id: 't1', text: 'Молоко', done: false }],
}

function stored() {
  return loadNotes()
}

describe('notes store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    useNotesStore().dispose()
    vi.useRealTimers()
  })

  it('loads notes from storage on init', () => {
    saveNotes([{ id: 'n1', ...content, createdAt: 1, updatedAt: 1 }])
    const store = useNotesStore()
    store.init()
    expect(store.loaded).toBe(true)
    expect(store.notes.map(n => n.id)).toEqual(['n1'])
  })

  it('trims the title and drops empty items on save', () => {
    const store = useNotesStore()
    const note = store.create({
      title: '  ',
      todos: [{ id: 'a', text: ' ', done: false }, { id: 'b', text: 'Сыр', done: false }],
    })
    expect(note.title).toBe('')
    expect(note.todos.map(t => t.id)).toEqual(['b'])

    store.update(note.id, { title: ' Новое ', todos: [{ id: 'c', text: '', done: true }] })
    expect(store.getById(note.id)).toMatchObject({ title: 'Новое', todos: [] })
  })

  it('creates a note with id and timestamps', () => {
    vi.setSystemTime(1000)
    const store = useNotesStore()
    const note = store.create(content)
    expect(note.id).toBeTruthy()
    expect(note.title).toBe('Покупки')
    expect(note.createdAt).toBe(1000)
    expect(note.updatedAt).toBe(1000)
    expect(store.getById(note.id)).toStrictEqual(note)
  })

  it('does not share todo objects with the passed content', () => {
    const store = useNotesStore()
    const note = store.create(content)
    content.todos[0]!.text = 'changed'
    expect(note.todos[0]!.text).toBe('Молоко')
    content.todos[0]!.text = 'Молоко'
  })

  it('updates content and updatedAt', () => {
    vi.setSystemTime(1000)
    const store = useNotesStore()
    const note = store.create(content)
    vi.setSystemTime(2000)
    store.update(note.id, { title: 'Новое', todos: [] })
    const updated = store.getById(note.id)!
    expect(updated.title).toBe('Новое')
    expect(updated.todos).toEqual([])
    expect(updated.createdAt).toBe(1000)
    expect(updated.updatedAt).toBe(2000)
  })

  it('returns undefined when updating missing note', () => {
    const store = useNotesStore()
    expect(store.update('nope', content)).toBeUndefined()
  })

  it('removes a note', () => {
    const store = useNotesStore()
    const note = store.create(content)
    expect(store.remove(note.id)).toBe(true)
    expect(store.getById(note.id)).toBeUndefined()
    expect(store.remove(note.id)).toBe(false)
  })

  it('sorts notes by updatedAt desc', () => {
    const store = useNotesStore()
    vi.setSystemTime(1000)
    const a = store.create({ ...content, title: 'a' })
    vi.setSystemTime(2000)
    const b = store.create({ ...content, title: 'b' })
    expect(store.sortedNotes.map(n => n.id)).toEqual([b.id, a.id])
    vi.setSystemTime(3000)
    store.update(a.id, content)
    expect(store.sortedNotes.map(n => n.id)).toEqual([a.id, b.id])
  })

  it('debounces writes to storage', () => {
    const store = useNotesStore()
    const spy = vi.spyOn(localStorage, 'setItem')
    const note = store.create(content)
    store.update(note.id, { ...content, title: '1' })
    store.update(note.id, { ...content, title: '2' })
    expect(spy).not.toHaveBeenCalled()
    expect(localStorage.getItem(NOTES_STORAGE_KEY)).toBeNull()

    vi.advanceTimersByTime(SAVE_DELAY)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(stored()[0]!.title).toBe('2')
  })

  it('flush writes pending changes immediately', () => {
    const store = useNotesStore()
    store.create(content)
    store.flush()
    expect(stored()).toHaveLength(1)
  })

  it('flush does nothing without changes', () => {
    const store = useNotesStore()
    const spy = vi.spyOn(localStorage, 'setItem')
    store.flush()
    expect(spy).not.toHaveBeenCalled()
  })

  it('writes on pagehide', () => {
    const store = useNotesStore()
    store.init()
    store.create(content)
    window.dispatchEvent(new Event('pagehide'))
    expect(stored()).toHaveLength(1)
  })

  it('writes when tab becomes hidden', () => {
    const store = useNotesStore()
    store.init()
    store.create(content)
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
    document.dispatchEvent(new Event('visibilitychange'))
    expect(stored()).toHaveLength(1)
  })

  it('reloads notes when another tab changes storage', () => {
    const store = useNotesStore()
    store.init()
    const note = store.create(content)
    store.flush()

    saveNotes([])
    window.dispatchEvent(new StorageEvent('storage', { key: NOTES_STORAGE_KEY }))
    expect(store.getById(note.id)).toBeUndefined()
  })

  it('reloads when storage is cleared in another tab', () => {
    const store = useNotesStore()
    store.init()
    store.create(content)
    store.flush()

    localStorage.clear()
    window.dispatchEvent(new StorageEvent('storage', { key: null }))
    expect(store.notes).toEqual([])
  })

  it('ignores storage events for other keys', () => {
    const store = useNotesStore()
    store.init()
    store.create(content)
    store.flush()

    saveNotes([])
    window.dispatchEvent(new StorageEvent('storage', { key: 'other' }))
    expect(store.notes).toHaveLength(1)
  })

  it('removal is persisted', () => {
    const store = useNotesStore()
    const note = store.create(content)
    store.flush()
    store.remove(note.id)
    vi.advanceTimersByTime(SAVE_DELAY)
    expect(stored()).toEqual([])
  })
})
