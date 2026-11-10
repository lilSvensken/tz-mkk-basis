<script setup lang="ts">
import type { NoteContent } from '~/types/note'
import { useNotesStore } from '~/stores/notes'
import { loadDraft, type Draft } from '~/utils/drafts'
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

useHead({
  title: () => {
    if (missing) return 'Заметка не найдена'
    return isNew ? 'Новая заметка' : content.title || 'Заметка'
  },
})

watch(isDirty, (dirty) => {
  if (dirty) justSaved.value = false
})

const draft = useNoteDraft(noteId, content, isDirty)
const draftPrompt = shallowRef<Draft | null>(null)
const draftTime = computed(() => draftPrompt.value
  ? new Date(draftPrompt.value.savedAt).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
  : '')

function restoreDraft() {
  const found = draftPrompt.value
  draftPrompt.value = null
  if (found) editor.reset(found.content)
}

function dismissDraft() {
  draftPrompt.value = null
  draft.discard()
}

onMounted(() => {
  if (missing) {
    draft.stop()
    return
  }
  const found = loadDraft(noteId)
  if (!found) return
  if (JSON.stringify(found.content) === JSON.stringify(saved.value)) draft.discard()
  else draftPrompt.value = found
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

const deletedElsewhere = ref(false)
const deletedPrompt = ref(false)
let removedHere = false

function markDeleted() {
  if (deletedElsewhere.value) return
  deletedElsewhere.value = true
  deletedPrompt.value = true
}

watch(() => (isNew || missing ? null : store.getById(noteId)), (note) => {
  if (isNew || missing || removedHere) return
  if (!note) {
    markDeleted()
    return
  }
  const fresh = cloneContent(note)
  if (isDirty.value || JSON.stringify(fresh) === JSON.stringify(saved.value)) return
  saved.value = fresh
  editor.reset(fresh)
})

function saveAsNew() {
  deletedPrompt.value = false
  const created = store.create(editor.snapshot())
  draft.stop()
  allowLeave = true
  router.replace(`/notes/${created.id}`)
}

async function closeDeleted() {
  deletedPrompt.value = false
  draft.stop()
  await leave()
}

function save() {
  if (isNew || deletedElsewhere.value) {
    saveAsNew()
    return
  }

  const next = editor.snapshot()
  draft.discard()
  const updated = store.update(noteId, next)
  if (!updated) {
    markDeleted()
    return
  }
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
  draft.stop()
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
  removedHere = true
  draft.stop()
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
    if (isNew || isDirty.value || deletedElsewhere.value) save()
  },
}, {
  enabled: () => !missing,
  hasPendingInput: () => editor.hasPendingInput.value,
})

onBeforeUnmount(editor.dispose)
</script>

<template>
  <section v-if="missing">
    <h1>Заметка не найдена</h1>
    <EmptyState
      title="Такой заметки нет"
      text="Возможно, она была удалена или в ссылке ошибка."
    >
      <UiButton to="/">
        К списку заметок
      </UiButton>
      <UiButton
        variant="primary"
        to="/notes/new"
      >
        Создать заметку
      </UiButton>
    </EmptyState>
  </section>

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

    <p
      v-if="deletedElsewhere"
      class="note-page__alert"
      role="alert"
    >
      Эта заметка удалена в другой вкладке. Сохранение создаст новую заметку.
    </p>

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
        v-if="!isNew && !deletedElsewhere"
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
        :disabled="!isNew && !isDirty && !deletedElsewhere"
        @click="save"
      >
        Сохранить
      </UiButton>
    </div>

    <UiModal
      :open="draftPrompt !== null"
      title="Восстановить черновик?"
      @close="draftPrompt = null"
    >
      <p>Найдены несохранённые изменения от {{ draftTime }}. Восстановить их?</p>
      <template #footer>
        <UiButton @click="dismissDraft">
          Не восстанавливать
        </UiButton>
        <UiButton
          variant="primary"
          data-autofocus
          @click="restoreDraft"
        >
          Восстановить
        </UiButton>
      </template>
    </UiModal>

    <UiModal
      :open="deletedPrompt"
      title="Заметка удалена"
      role="alertdialog"
      @close="deletedPrompt = false"
    >
      <p>Эту заметку удалили в другой вкладке. Сохранить текущее содержимое как новую заметку?</p>
      <template #footer>
        <UiButton @click="closeDeleted">
          Закрыть без сохранения
        </UiButton>
        <UiButton
          variant="primary"
          data-autofocus
          @click="saveAsNew"
        >
          Сохранить как новую
        </UiButton>
      </template>
    </UiModal>
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

  &__alert {
    padding: $space-3 $space-4;
    color: var(--color-danger);
    background: var(--color-surface);
    border: 1px solid currentcolor;
    border-radius: $radius-md;
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
