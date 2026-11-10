import type { NoteContent } from '~/types/note'

export const UNTITLED = 'Без названия'

export function cloneContent(content: NoteContent): NoteContent {
  return {
    title: content.title,
    todos: content.todos.map(todo => ({ ...todo })),
  }
}

export function normalizeContent(content: NoteContent): NoteContent {
  return {
    title: content.title.trim(),
    todos: content.todos
      .map(todo => ({ ...todo, text: todo.text.trim() }))
      .filter(todo => todo.text !== ''),
  }
}

export function displayTitle(title: string): string {
  return title.trim() || UNTITLED
}
