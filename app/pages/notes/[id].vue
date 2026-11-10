<script setup lang="ts">
import type { NoteContent } from '~/types/note'
import { useNotesStore } from '~/stores/notes'
import { cloneContent } from '~/utils/noteContent'
import { createNoteEditor } from '~/utils/noteEditor'

const route = useRoute()
const router = useRouter()
const store = useNotesStore()
const confirm = useConfirm()

const noteId = String(route.params.id)
const isNew = noteId === 'new'
const initial = isNew ? undefined : store.getById(noteId)
const missing = !isNew && !initial

const saved = shallowRef<NoteContent>(cloneContent(initial ?? { title: '', todos: [] }))
const editor = createNoteEditor(saved.value)
const content = editor.content

const isDirty = computed(() => JSON.stringify(content) !== JSON.stringify(saved.value))
const justSaved = ref(false)
let allowLeave = false

useHead({ title: () => isNew ? 'Новая заметка' : content.title || 'Заметка' })

watch(isDirty, (dirty) => {
  if (dirty) justSaved.value = false
})

type Focusable = { focus: () => void }

const rows = new Map<string, Focusable>()
const addButton = ref<{ $el: HTMLElement } | null>(null)

function setRow(id: string, row: unknown) {
  if (row) rows.set(id, row as Focusable)
  else rows.delete(id)
}

async function focusTodo(id: string | undefined) {
  await nextTick()
  const row = id ? rows.get(id) : undefined
  if (row) row.focus()
  else addButton.value?.$el.focus()
}

function addTodo(index?: number) {
  const todo = editor.addTodo(index)
  focusTodo(todo.id)
}

function removeTodo(index: number, focusPrevious: boolean) {
  const todo = content.todos[index]
  if (!todo) return
  editor.removeTodo(todo.id)
  const next = focusPrevious
    ? content.todos[index - 1] ?? content.todos[index]
    : content.todos[index] ?? content.todos[index - 1]
  focusTodo(next?.id)
}

function leave() {
  allowLeave = true
  return router.push('/')
}

function save() {
  const next = editor.snapshot()

  if (isNew) {
    const created = store.create(next)
    allowLeave = true
    router.replace(`/notes/${created.id}`)
    return
  }

  const updated = store.update(noteId, next)
  if (!updated) return
  saved.value = cloneContent(updated)
  editor.reset(saved.value)
  justSaved.value = true
}

async function cancel() {
  if (isDirty.value) {
    const ok = await confirm({
      title: 'Отменить изменения?',
      message: 'Все несохранённые изменения будут потеряны.',
      confirmText: 'Отменить изменения',
      cancelText: 'Продолжить',
      danger: true,
    })
    if (!ok) return
  }
  editor.reset(saved.value)
  await leave()
}

async function removeNote() {
  const ok = await confirm({
    title: 'Удалить заметку?',
    message: 'Заметка будет удалена без возможности восстановления.',
    confirmText: 'Удалить',
    danger: true,
  })
  if (!ok) return
  store.remove(noteId)
  await leave()
}

onBeforeRouteLeave(async () => {
  if (allowLeave || missing || !isDirty.value) return true
  return confirm({
    title: 'Уйти без сохранения?',
    message: 'Несохранённые изменения будут потеряны.',
    confirmText: 'Уйти',
    cancelText: 'Остаться',
    danger: true,
  })
})

useEditorHotkeys({
  undo: editor.undo,
  redo: editor.redo,
  save: () => {
    if (isNew || isDirty.value) save()
  },
}, () => !missing)

onBeforeUnmount(editor.dispose)
</script>

<template>
  <EmptyState
    v-if="missing"
    title="Заметка не найдена"
    text="Возможно, она была удалена или ссылка неверная."
  >
    <UiButton to="/">
      К списку заметок
    </UiButton>
  </EmptyState>

  <section
    v-else
    class="note-page"
  >
    <h1 class="visually-hidden">
      {{ isNew ? 'Новая заметка' : 'Редактирование заметки' }}
    </h1>

    <div class="note-page__top">
      <NuxtLink
        to="/"
        class="note-page__back"
      >
        ← Все заметки
      </NuxtLink>
      <div class="note-page__tools">
        <p
          class="note-page__status"
          role="status"
        >
          <template v-if="isDirty">
            Есть несохранённые изменения
          </template>
          <template v-else-if="justSaved">
            Сохранено
          </template>
        </p>
        <UiButton
          variant="ghost"
          size="sm"
          icon
          aria-label="Отменить действие"
          title="Отменить действие (Ctrl+Z)"
          aria-keyshortcuts="Control+Z"
          :disabled="!editor.canUndo.value"
          @click="editor.undo"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M7 4L3 8l4 4M3 8h9a5 5 0 010 10H9"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </UiButton>
        <UiButton
          variant="ghost"
          size="sm"
          icon
          aria-label="Повторить действие"
          title="Повторить действие (Ctrl+Shift+Z)"
          aria-keyshortcuts="Control+Shift+Z"
          :disabled="!editor.canRedo.value"
          @click="editor.redo"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M13 4l4 4-4 4M17 8H8a5 5 0 000 10h3"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </UiButton>
      </div>
    </div>

    <div class="note-page__card">
      <UiInput
        :model-value="content.title"
        label="Название"
        hide-label
        size="lg"
        plain
        placeholder="Без названия"
        @update:model-value="editor.setTitle"
        @blur="editor.commit"
      />

      <ul
        v-if="content.todos.length > 0"
        class="note-page__todos"
        aria-label="Список дел"
      >
        <TodoRow
          v-for="(todo, index) in content.todos"
          :key="todo.id"
          :ref="(row) => setRow(todo.id, row)"
          :todo="todo"
          :index="index"
          @toggle="editor.toggleTodo(todo.id)"
          @update:text="editor.setTodoText(todo.id, $event)"
          @commit="editor.commit"
          @remove="removeTodo(index, false)"
          @remove-empty="removeTodo(index, true)"
          @enter="addTodo(index + 1)"
        />
      </ul>

      <UiButton
        ref="addButton"
        variant="ghost"
        class="note-page__add"
        @click="addTodo()"
      >
        + Добавить пункт
      </UiButton>
    </div>

    <div class="note-page__actions">
      <UiButton
        v-if="!isNew"
        variant="ghost"
        class="note-page__delete"
        @click="removeNote"
      >
        Удалить
      </UiButton>
      <UiButton @click="cancel">
        Отменить
      </UiButton>
      <UiButton
        variant="primary"
        :disabled="!isNew && !isDirty"
        @click="save"
      >
        Сохранить
      </UiButton>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.note-page {
  display: flex;
  flex-direction: column;
  gap: $space-4;
  max-width: 720px;
  margin-inline: auto;

  &__top {
    display: flex;
    flex-wrap: wrap;
    gap: $space-2 $space-4;
    align-items: center;
    justify-content: space-between;
  }

  &__back {
    color: var(--color-text-muted);
    text-decoration: none;
    border-radius: $radius-sm;

    @include focus-ring;

    &:hover {
      color: var(--color-text);
    }
  }

  &__tools {
    display: flex;
    gap: $space-1;
    align-items: center;
  }

  &__status {
    min-height: 1.5em;
    margin-right: $space-2;
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  &__card {
    display: flex;
    flex-direction: column;
    gap: $space-3;
    padding: $space-3;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: $radius-md;
    box-shadow: var(--shadow-card);

    @include from($bp-md) {
      padding: $space-4 $space-5;
    }
  }

  &__todos {
    display: flex;
    flex-direction: column;
    gap: $space-1;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  &__add {
    align-self: flex-start;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: $space-2;
    justify-content: flex-end;
  }

  &__delete {
    margin-right: auto;
    color: var(--color-danger);
  }
}
</style>
