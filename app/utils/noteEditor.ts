import { computed, reactive, shallowRef } from 'vue'
import type { NoteContent, TodoItem } from '~/types/note'
import { createHistory } from '~/utils/history'
import { createId } from '~/utils/id'
import { cloneContent } from '~/utils/noteContent'
import { applyPatch, invertPatch, type NotePatch } from '~/utils/notePatches'

export const TYPING_PAUSE = 700

type TextTarget = { kind: 'title' } | { kind: 'text', id: string }

interface PendingText {
  target: TextTarget
  from: string
}

function sameTarget(a: TextTarget, b: TextTarget): boolean {
  if (a.kind === 'title' || b.kind === 'title') return a.kind === b.kind
  return a.id === b.id
}

export function createNoteEditor(initial: NoteContent, options: { pause?: number, limit?: number } = {}) {
  const pause = options.pause ?? TYPING_PAUSE
  const content = reactive(cloneContent(initial)) as NoteContent
  const history = createHistory<NotePatch>(invertPatch, options.limit)
  const pending = shallowRef<PendingText | null>(null)
  let timer: ReturnType<typeof setTimeout> | null = null

  function clearTimer() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  function readText(target: TextTarget): string | undefined {
    if (target.kind === 'title') return content.title
    return content.todos.find(todo => todo.id === target.id)?.text
  }

  function commit() {
    clearTimer()
    const current = pending.value
    if (!current) return
    pending.value = null

    const to = readText(current.target)
    if (to === undefined || to === current.from) return

    history.push(current.target.kind === 'title'
      ? { type: 'title', from: current.from, to }
      : { type: 'text', id: current.target.id, from: current.from, to })
  }

  function input(target: TextTarget, value: string) {
    const before = readText(target)
    if (before === undefined) return

    if (pending.value && !sameTarget(pending.value.target, target)) commit()
    if (!pending.value) pending.value = { target, from: before }

    if (target.kind === 'title') {
      content.title = value
    }
    else {
      const todo = content.todos.find(item => item.id === target.id)
      if (todo) todo.text = value
    }

    clearTimer()
    timer = setTimeout(commit, pause)
  }

  function change(patch: NotePatch) {
    commit()
    applyPatch(content, patch)
    history.push(patch)
  }

  function setTitle(value: string) {
    input({ kind: 'title' }, value)
  }

  function setTodoText(id: string, value: string) {
    input({ kind: 'text', id }, value)
  }

  function toggleTodo(id: string) {
    const todo = content.todos.find(item => item.id === id)
    if (!todo) return
    change({ type: 'done', id, from: todo.done, to: !todo.done })
  }

  function addTodo(index = content.todos.length, text = ''): TodoItem {
    const todo: TodoItem = { id: createId(), text, done: false }
    change({ type: 'add', index, todo })
    return todo
  }

  function removeTodo(id: string) {
    const index = content.todos.findIndex(item => item.id === id)
    if (index === -1) return
    change({ type: 'remove', index, todo: { ...content.todos[index]! } })
  }

  function undo() {
    commit()
    const patch = history.undo()
    if (patch) applyPatch(content, patch)
  }

  function redo() {
    commit()
    const patch = history.redo()
    if (patch) applyPatch(content, patch)
  }

  function reset(next: NoteContent = content) {
    clearTimer()
    pending.value = null
    const copy = cloneContent(next)
    content.title = copy.title
    content.todos = copy.todos
    history.reset()
  }

  function snapshot(): NoteContent {
    commit()
    return cloneContent(content)
  }

  return {
    content,
    history,
    canUndo: computed(() => history.canUndo.value || pending.value !== null),
    canRedo: computed(() => history.canRedo.value && pending.value === null),
    hasPendingInput: computed(() => pending.value !== null),
    setTitle,
    setTodoText,
    toggleTodo,
    addTodo,
    removeTodo,
    commit,
    undo,
    redo,
    reset,
    snapshot,
    dispose: clearTimer,
  }
}

export type NoteEditor = ReturnType<typeof createNoteEditor>
