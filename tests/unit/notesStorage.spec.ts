import { beforeEach, describe, expect, it } from 'vitest'
import type { Note } from '~/types/note'
import {
  loadNotes,
  migrate,
  NOTES_SCHEMA_VERSION,
  NOTES_STORAGE_KEY,
  parseNotes,
  saveNotes,
} from '~/utils/notesStorage'

const note: Note = {
  id: 'n1',
  title: 'Покупки',
  todos: [
    { id: 't1', text: 'Молоко', done: false },
    { id: 't2', text: 'Хлеб', done: true },
  ],
  createdAt: 1,
  updatedAt: 2,
}

describe('notesStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saves notes with schema version', () => {
    expect(saveNotes([note])).toBe(true)

    const raw = JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY)!)
    expect(raw).toEqual({ version: NOTES_SCHEMA_VERSION, notes: [note] })
  })

  it('loads what was saved', () => {
    saveNotes([note])
    expect(loadNotes()).toEqual([note])
  })

  it('returns empty list when nothing is stored', () => {
    expect(loadNotes()).toEqual([])
  })

  it('returns empty list for broken json', () => {
    localStorage.setItem(NOTES_STORAGE_KEY, '{not json')
    expect(loadNotes()).toEqual([])
  })

  it('returns empty list for data without version', () => {
    expect(parseNotes({ notes: [note] })).toEqual([])
    expect(parseNotes([note])).toEqual([])
  })

  it('returns empty list for unknown future version', () => {
    expect(parseNotes({ version: NOTES_SCHEMA_VERSION + 1, notes: [note] })).toEqual([])
  })

  it('drops malformed notes and keeps valid ones', () => {
    const broken = { ...note, id: 'n2', todos: [{ id: 'x', text: 1, done: false }] }
    expect(parseNotes({ version: NOTES_SCHEMA_VERSION, notes: [note, broken, null, 'x'] })).toEqual([note])
  })

  it('returns empty list when notes field is not an array', () => {
    expect(parseNotes({ version: NOTES_SCHEMA_VERSION, notes: {} })).toEqual([])
  })
})

describe('migrate', () => {
  it('passes current version through', () => {
    const data = { version: NOTES_SCHEMA_VERSION, notes: [] }
    expect(migrate(data)).toEqual(data)
  })

  it('applies migrations step by step', () => {
    const map = {
      [NOTES_SCHEMA_VERSION - 2]: (d: { version: number }) => ({ ...d, version: d.version + 1, a: true }),
      [NOTES_SCHEMA_VERSION - 1]: (d: { version: number }) => ({ ...d, version: d.version + 1, b: true }),
    }
    const result = migrate({ version: NOTES_SCHEMA_VERSION - 2 }, map)
    expect(result).toEqual({ version: NOTES_SCHEMA_VERSION, a: true, b: true })
  })

  it('fails when a migration step is missing', () => {
    expect(migrate({ version: NOTES_SCHEMA_VERSION - 1 }, {})).toBeNull()
  })

  it('fails when a migration does not bump version', () => {
    const map = { [NOTES_SCHEMA_VERSION - 1]: (d: { version: number }) => d }
    expect(migrate({ version: NOTES_SCHEMA_VERSION - 1 }, map)).toBeNull()
  })
})
