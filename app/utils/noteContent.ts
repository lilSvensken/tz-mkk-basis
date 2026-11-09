import type { NoteContent } from '~/types/note'

export function cloneContent(content: NoteContent): NoteContent {
  return {
    title: content.title,
    todos: content.todos.map(todo => ({ ...todo })),
  }
}
