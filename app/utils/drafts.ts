import type { NoteContent } from '~/types/note'
import { isRecord, isTodoItem } from './notesStorage'
import { readJson, removeKey, writeJson } from './storage'

export const DRAFT_KEY_PREFIX = 'notes-draft:'
export const DRAFT_SCHEMA_VERSION = 1

export interface Draft {
  noteId: string
  content: NoteContent
  savedAt: number
}

export function draftKey(noteId: string): string {
  return `${DRAFT_KEY_PREFIX}${noteId}`
}

function isContent(value: unknown): value is NoteContent {
  return isRecord(value)
    && typeof value.title === 'string'
    && Array.isArray(value.todos)
    && value.todos.every(isTodoItem)
}

export function parseDraft(raw: unknown, noteId: string): Draft | null {
  if (!isRecord(raw) || raw.version !== DRAFT_SCHEMA_VERSION) return null
  if (raw.noteId !== noteId || typeof raw.savedAt !== 'number' || !isContent(raw.content)) return null
  return {
    noteId,
    savedAt: raw.savedAt,
    content: {
      title: raw.content.title,
      todos: raw.content.todos.map(todo => ({ id: todo.id, text: todo.text, done: todo.done })),
    },
  }
}

export function loadDraft(noteId: string): Draft | null {
  return parseDraft(readJson(draftKey(noteId)), noteId)
}

export function saveDraft(noteId: string, content: NoteContent, now = Date.now()): boolean {
  return writeJson(draftKey(noteId), {
    version: DRAFT_SCHEMA_VERSION,
    noteId,
    savedAt: now,
    content,
  })
}

export function removeDraft(noteId: string): void {
  removeKey(draftKey(noteId))
}
