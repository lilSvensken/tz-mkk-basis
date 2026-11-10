import type { Note, TodoItem } from '~/types/note'
import { readJson, writeJson } from './storage'

export const NOTES_STORAGE_KEY = 'notes'
export const NOTES_SCHEMA_VERSION = 1

type StoredData = Record<string, unknown> & { version: number }
type Migration = (data: StoredData) => StoredData

const migrations: Record<number, Migration> = {}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isTodoItem(value: unknown): value is TodoItem {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.text === 'string'
    && typeof value.done === 'boolean'
}

function isNote(value: unknown): value is Note {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.title === 'string'
    && typeof value.createdAt === 'number'
    && typeof value.updatedAt === 'number'
    && Array.isArray(value.todos)
    && value.todos.every(isTodoItem)
}

export function migrate(raw: unknown, migrationMap: Record<number, Migration> = migrations): StoredData | null {
  if (!isRecord(raw) || typeof raw.version !== 'number') return null

  let data = raw as StoredData
  while (data.version < NOTES_SCHEMA_VERSION) {
    const step = migrationMap[data.version]
    if (!step) return null
    const next = step(data)
    if (next.version <= data.version) return null
    data = next
  }

  return data.version === NOTES_SCHEMA_VERSION ? data : null
}

export function parseNotes(raw: unknown): Note[] {
  const data = migrate(raw)
  if (!data || !Array.isArray(data.notes)) return []
  return data.notes.filter(isNote)
}

export function loadNotes(): Note[] {
  return parseNotes(readJson(NOTES_STORAGE_KEY))
}

export function saveNotes(notes: Note[]): boolean {
  return writeJson(NOTES_STORAGE_KEY, { version: NOTES_SCHEMA_VERSION, notes })
}
