import type { NoteContent, TodoItem } from '~/types/note'

export type NotePatch
  = | { type: 'title', from: string, to: string }
    | { type: 'text', id: string, from: string, to: string }
    | { type: 'done', id: string, from: boolean, to: boolean }
    | { type: 'add', index: number, todo: TodoItem }
    | { type: 'remove', index: number, todo: TodoItem }

export function invertPatch(patch: NotePatch): NotePatch {
  switch (patch.type) {
    case 'title':
    case 'text':
    case 'done':
      return { ...patch, from: patch.to, to: patch.from } as NotePatch
    case 'add':
      return { type: 'remove', index: patch.index, todo: patch.todo }
    case 'remove':
      return { type: 'add', index: patch.index, todo: patch.todo }
  }
}

function findTodo(content: NoteContent, id: string): TodoItem | undefined {
  return content.todos.find(todo => todo.id === id)
}

export function applyPatch(content: NoteContent, patch: NotePatch): void {
  switch (patch.type) {
    case 'title':
      content.title = patch.to
      break
    case 'text': {
      const todo = findTodo(content, patch.id)
      if (todo) todo.text = patch.to
      break
    }
    case 'done': {
      const todo = findTodo(content, patch.id)
      if (todo) todo.done = patch.to
      break
    }
    case 'add': {
      const index = Math.min(Math.max(patch.index, 0), content.todos.length)
      content.todos.splice(index, 0, { ...patch.todo })
      break
    }
    case 'remove': {
      const index = content.todos.findIndex(todo => todo.id === patch.todo.id)
      if (index !== -1) content.todos.splice(index, 1)
      break
    }
  }
}
