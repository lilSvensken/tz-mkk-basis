import { describe, expect, it } from 'vitest'
import type { NoteContent } from '~/types/note'
import { createHistory, HISTORY_LIMIT } from '~/utils/history'
import { applyPatch, invertPatch, type NotePatch } from '~/utils/notePatches'

function makeContent(): NoteContent {
  return {
    title: 'Список',
    todos: [
      { id: 'a', text: 'Первый', done: false },
      { id: 'b', text: 'Второй', done: true },
    ],
  }
}

function setup() {
  const content = makeContent()
  const history = createHistory<NotePatch>(invertPatch)

  function change(patch: NotePatch) {
    applyPatch(content, patch)
    history.push(patch)
  }
  function undo() {
    const patch = history.undo()
    if (patch) applyPatch(content, patch)
  }
  function redo() {
    const patch = history.redo()
    if (patch) applyPatch(content, patch)
  }

  return { content, history, change, undo, redo }
}

describe('history', () => {
  it('undoes and redoes a title change', () => {
    const { content, change, undo, redo } = setup()
    change({ type: 'title', from: 'Список', to: 'Новый' })
    undo()
    expect(content.title).toBe('Список')
    redo()
    expect(content.title).toBe('Новый')
  })

  it('undoes add and remove at the right position', () => {
    const { content, change, undo } = setup()
    const todo = { id: 'c', text: 'Третий', done: false }
    change({ type: 'add', index: 1, todo })
    expect(content.todos.map(t => t.id)).toEqual(['a', 'c', 'b'])
    undo()
    expect(content.todos.map(t => t.id)).toEqual(['a', 'b'])

    change({ type: 'remove', index: 0, todo: content.todos[0]! })
    expect(content.todos.map(t => t.id)).toEqual(['b'])
    undo()
    expect(content.todos).toEqual(makeContent().todos)
  })

  it('undoes toggle and text change', () => {
    const { content, change, undo } = setup()
    change({ type: 'done', id: 'a', from: false, to: true })
    change({ type: 'text', id: 'b', from: 'Второй', to: 'Изменён' })
    undo()
    undo()
    expect(content).toEqual(makeContent())
  })

  it('new change clears redo branch', () => {
    const { history, change, undo } = setup()
    change({ type: 'title', from: 'Список', to: '1' })
    undo()
    expect(history.canRedo.value).toBe(true)
    change({ type: 'title', from: 'Список', to: '2' })
    expect(history.canRedo.value).toBe(false)
  })

  it('keeps only the last 50 steps', () => {
    const { content, history, change, undo } = setup()
    for (let i = 0; i < HISTORY_LIMIT + 10; i++) {
      change({ type: 'title', from: content.title, to: String(i) })
    }
    expect(history.past.value).toHaveLength(HISTORY_LIMIT)
    while (history.canUndo.value) undo()
    expect(content.title).toBe('9')
  })

  it('reset clears both stacks', () => {
    const { history, change, undo } = setup()
    change({ type: 'title', from: 'Список', to: '1' })
    change({ type: 'title', from: '1', to: '2' })
    undo()
    history.reset()
    expect(history.canUndo.value).toBe(false)
    expect(history.canRedo.value).toBe(false)
  })

  it('undo and redo on empty history return undefined', () => {
    const { history } = setup()
    expect(history.undo()).toBeUndefined()
    expect(history.redo()).toBeUndefined()
  })
})
