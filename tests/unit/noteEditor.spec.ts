import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NoteContent } from '~/types/note'
import { HISTORY_LIMIT } from '~/utils/history'
import { createNoteEditor, TYPING_PAUSE } from '~/utils/noteEditor'

function makeContent(): NoteContent {
  return {
    title: 'Список',
    todos: [
      { id: 'a', text: 'Первый', done: false },
      { id: 'b', text: 'Второй', done: true },
    ],
  }
}

function type(set: (value: string) => void, from: string, chars: string) {
  let value = from
  for (const char of chars) {
    value += char
    set(value)
  }
  return value
}

describe('note editor history', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not change the initial content object', () => {
    const initial = makeContent()
    const editor = createNoteEditor(initial)
    editor.setTitle('x')
    editor.toggleTodo('a')
    expect(initial).toEqual(makeContent())
  })

  describe('continuous typing', () => {
    it('is one history step, not one per character', () => {
      const editor = createNoteEditor(makeContent())
      type(editor.setTitle, 'Список', ' дел')
      editor.commit()
      expect(editor.history.past.value).toHaveLength(1)

      editor.undo()
      expect(editor.content.title).toBe('Список')
    })

    it('is committed after a typing pause', () => {
      const editor = createNoteEditor(makeContent())
      type(editor.setTitle, 'Список', ' 1')
      expect(editor.history.past.value).toHaveLength(0)
      vi.advanceTimersByTime(TYPING_PAUSE)
      expect(editor.history.past.value).toEqual([{ type: 'title', from: 'Список', to: 'Список 1' }])

      type(editor.setTitle, 'Список 1', '2')
      vi.advanceTimersByTime(TYPING_PAUSE)
      expect(editor.history.past.value).toHaveLength(2)
    })

    it('keeps typing within the pause in one step', () => {
      const editor = createNoteEditor(makeContent())
      editor.setTitle('С')
      vi.advanceTimersByTime(TYPING_PAUSE - 1)
      editor.setTitle('Со')
      vi.advanceTimersByTime(TYPING_PAUSE - 1)
      editor.setTitle('Сон')
      vi.advanceTimersByTime(TYPING_PAUSE)
      expect(editor.history.past.value).toEqual([{ type: 'title', from: 'Список', to: 'Сон' }])
    })

    it('is committed on blur', () => {
      const editor = createNoteEditor(makeContent())
      editor.setTodoText('a', 'Первый!')
      editor.commit()
      expect(editor.history.past.value).toEqual([{ type: 'text', id: 'a', from: 'Первый', to: 'Первый!' }])
    })

    it('switching to another field starts a new step', () => {
      const editor = createNoteEditor(makeContent())
      editor.setTodoText('a', 'A')
      editor.setTodoText('b', 'B')
      editor.setTitle('T')
      editor.commit()
      expect(editor.history.past.value.map(p => p.type)).toEqual(['text', 'text', 'title'])
    })

    it('does not record a step when text returns to the original', () => {
      const editor = createNoteEditor(makeContent())
      editor.setTitle('Списокк')
      editor.setTitle('Список')
      editor.commit()
      expect(editor.history.past.value).toHaveLength(0)
    })

    it('undo during typing reverts the whole typed chunk', () => {
      const editor = createNoteEditor(makeContent())
      type(editor.setTodoText.bind(null, 'b'), 'Второй', ' пункт')
      expect(editor.canUndo.value).toBe(true)
      editor.undo()
      expect(editor.content.todos[1]!.text).toBe('Второй')
      expect(editor.canRedo.value).toBe(true)
    })
  })

  describe('atomic changes', () => {
    it('toggle is a separate step', () => {
      const editor = createNoteEditor(makeContent())
      editor.toggleTodo('a')
      editor.toggleTodo('b')
      expect(editor.history.past.value).toHaveLength(2)
      editor.undo()
      expect(editor.content.todos.map(t => t.done)).toEqual([true, true])
      editor.undo()
      expect(editor.content).toEqual(makeContent())
    })

    it('add is a separate step and undo removes the item', () => {
      const editor = createNoteEditor(makeContent())
      const todo = editor.addTodo()
      expect(editor.content.todos.at(-1)).toEqual(todo)
      editor.undo()
      expect(editor.content).toEqual(makeContent())
      editor.redo()
      expect(editor.content.todos.at(-1)).toEqual(todo)
    })

    it('remove is a separate step and undo restores item at its place', () => {
      const editor = createNoteEditor(makeContent())
      editor.removeTodo('a')
      expect(editor.content.todos.map(t => t.id)).toEqual(['b'])
      editor.undo()
      expect(editor.content).toEqual(makeContent())
    })

    it('pending typing is committed before an atomic change', () => {
      const editor = createNoteEditor(makeContent())
      editor.setTitle('Новое')
      editor.toggleTodo('a')
      expect(editor.history.past.value.map(p => p.type)).toEqual(['title', 'done'])
      editor.undo()
      expect(editor.content.title).toBe('Новое')
      expect(editor.content.todos[0]!.done).toBe(false)
    })

    it('typing in a new item then undo goes back step by step', () => {
      const editor = createNoteEditor(makeContent())
      const todo = editor.addTodo()
      type(editor.setTodoText.bind(null, todo.id), '', 'Хлеб')
      editor.commit()
      editor.undo()
      expect(editor.content.todos.at(-1)!.text).toBe('')
      editor.undo()
      expect(editor.content).toEqual(makeContent())
      editor.redo()
      editor.redo()
      expect(editor.content.todos.at(-1)!.text).toBe('Хлеб')
    })
  })

  describe('redo branch', () => {
    it('new change after undo clears redo', () => {
      const editor = createNoteEditor(makeContent())
      editor.toggleTodo('a')
      editor.undo()
      expect(editor.canRedo.value).toBe(true)
      editor.addTodo()
      expect(editor.canRedo.value).toBe(false)
      editor.redo()
      expect(editor.content.todos[0]!.done).toBe(false)
    })

    it('typing after undo clears redo', () => {
      const editor = createNoteEditor(makeContent())
      editor.toggleTodo('a')
      editor.undo()
      editor.setTitle('x')
      editor.commit()
      expect(editor.canRedo.value).toBe(false)
    })
  })

  describe('limit', () => {
    it('keeps at most 50 steps', () => {
      const editor = createNoteEditor(makeContent())
      for (let i = 0; i < HISTORY_LIMIT + 5; i++) editor.toggleTodo('a')
      expect(editor.history.past.value).toHaveLength(HISTORY_LIMIT)
      let undone = 0
      while (editor.canUndo.value) {
        editor.undo()
        undone++
      }
      expect(undone).toBe(HISTORY_LIMIT)
    })

    it('stores patches, not copies of the note', () => {
      const editor = createNoteEditor(makeContent())
      for (let i = 0; i < HISTORY_LIMIT; i++) editor.toggleTodo('a')
      for (const patch of editor.history.past.value) {
        expect(patch).not.toHaveProperty('todos')
        expect(patch).not.toHaveProperty('title')
      }
    })
  })

  describe('reset', () => {
    it('clears history and pending input', () => {
      const editor = createNoteEditor(makeContent())
      editor.toggleTodo('a')
      editor.setTitle('x')
      editor.reset()
      expect(editor.canUndo.value).toBe(false)
      expect(editor.canRedo.value).toBe(false)
      vi.advanceTimersByTime(TYPING_PAUSE)
      expect(editor.history.past.value).toHaveLength(0)
    })

    it('can replace content', () => {
      const editor = createNoteEditor(makeContent())
      editor.toggleTodo('a')
      editor.reset(makeContent())
      expect(editor.content).toEqual(makeContent())
      expect(editor.canUndo.value).toBe(false)
    })
  })

  it('snapshot commits pending input and returns a copy', () => {
    const editor = createNoteEditor(makeContent())
    editor.setTitle('Новое')
    const snap = editor.snapshot()
    expect(snap.title).toBe('Новое')
    expect(editor.history.past.value).toHaveLength(1)
    snap.todos[0]!.text = 'x'
    expect(editor.content.todos[0]!.text).toBe('Первый')
  })
})
