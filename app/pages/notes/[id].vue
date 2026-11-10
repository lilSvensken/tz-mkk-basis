<template>
  <section
    v-if="missing"
    class="note-missing"
  >
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

    <nav
      class="note-page__bar"
      aria-label="Действия с заметкой"
    >
      <NuxtLink
        to="/"
        class="note-page__back"
      >
        <IconChevronLeft />
        Заметки
      </NuxtLink>
      <div class="note-page__tools">
        <UiButton
          variant="ghost"
          icon
          aria-label="Отменить действие"
          title="Отменить действие (Ctrl+Z)"
          aria-keyshortcuts="Control+Z"
          :disabled="!editor.canUndo.value"
          @click="editor.undo"
        >
          <IconUndo />
        </UiButton>
        <UiButton
          variant="ghost"
          icon
          aria-label="Повторить действие"
          title="Повторить действие (Ctrl+Shift+Z)"
          aria-keyshortcuts="Control+Shift+Z"
          :disabled="!editor.canRedo.value"
          @click="editor.redo"
        >
          <IconRedo />
        </UiButton>
        <UiButton
          variant="ghost"
          class="note-page__done"
          title="Сохранить (Ctrl+S)"
          aria-keyshortcuts="Control+S"
          :disabled="!isNew && !isDirty && !deletedElsewhere"
          @click="save"
        >
          Готово
        </UiButton>
      </div>
    </nav>

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
      <template v-else-if="updatedLabel">
        {{ updatedLabel }}
      </template>
    </p>

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

    <div class="note-page__toolbar">
      <UiButton
        variant="ghost"
        icon
        aria-label="Добавить пункт"
        title="Добавить пункт"
        @click="addTodo()"
      >
        <IconChecklist />
      </UiButton>
      <UiButton
        v-if="!isNew && !deletedElsewhere"
        variant="ghost"
        icon
        aria-label="Удалить заметку"
        title="Удалить заметку"
        @click="removeNote"
      >
        <IconTrash />
      </UiButton>
      <UiButton
        variant="ghost"
        class="note-page__cancel"
        @click="cancel"
      >
        Отменить
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

<script setup lang="ts">
import type { NoteContent } from '~/types/note'
import { useNotesStore } from '~/stores/notes'
import { loadDraft, type Draft } from '~/utils/drafts'
import { cloneContent, displayTitle } from '~/utils/noteContent'
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
const justCreated = useState<string | null>('note-just-created', () => null)
const justSaved = ref(justCreated.value === noteId)
justCreated.value = null
const updatedAt = ref(initial?.updatedAt ?? null)
const updatedLabel = computed(() => updatedAt.value
  ? new Date(updatedAt.value).toLocaleString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '')
let allowLeave = false

useHead({
  title: () => {
    if (missing) return 'Заметка не найдена'
    return isNew && !content.title.trim() ? 'Новая заметка' : displayTitle(content.title)
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
  updatedAt.value = note.updatedAt
  editor.reset(fresh)
})

function saveAsNew() {
  deletedPrompt.value = false
  const created = store.create(editor.snapshot())
  draft.stop()
  allowLeave = true
  justCreated.value = created.id
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
  updatedAt.value = updated.updatedAt
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

<style lang="scss" scoped>
.note-missing {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.note-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-width: var(--content-max);
  min-height: calc(100dvh - var(--header-height) - var(--space-6));
  margin-inline: auto;

  @include from($bp-md) {
    min-height: 0;
  }

  &__bar {
    display: flex;
    gap: var(--space-2);
    align-items: center;
    justify-content: space-between;
    margin-inline: calc(-1 * var(--space-2));
  }

  &__back {
    --icon-size: 1.25rem;

    display: inline-flex;
    gap: var(--space-1);
    align-items: center;
    min-height: var(--control-height);
    padding: 0 var(--space-2) 0 var(--space-1);
    font-size: var(--font-size-base);
    color: var(--color-accent-text);
    text-decoration: none;
    border-radius: var(--radius-sm);

    @include focus-ring;

    &:active {
      opacity: 0.6;
    }
  }

  &__tools {
    display: flex;
    align-items: center;
  }

  &__done {
    font-weight: 700;
  }

  &__status {
    min-height: 1.25rem;
    font-size: var(--font-size-xs);
    line-height: 1.25rem;
    color: var(--color-text-muted);
    text-align: center;
  }

  &__alert {
    padding: var(--space-3) var(--space-4);
    font-size: var(--font-size-md);
    color: var(--color-danger);
    background: var(--color-surface);
    border-radius: var(--radius-md);
    box-shadow: inset 0 0 0 1px currentcolor;
  }

  &__card {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-3);
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);

    @include from($bp-md) {
      padding: var(--space-5) var(--space-6);
    }
  }

  &__todos {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    padding: 0;
    margin: 0;
    list-style: none;
  }

  &__add {
    align-self: flex-start;
  }

  &__toolbar {
    position: sticky;
    bottom: 0;
    z-index: 1;
    display: flex;
    gap: var(--space-2);
    align-items: center;
    padding: var(--space-2) var(--space-2) calc(var(--space-2) + env(safe-area-inset-bottom));
    margin: auto calc(-1 * var(--space-4)) calc(-1 * var(--space-6));
    background: var(--color-bar);
    border-top: 0.5px solid var(--color-border);
    backdrop-filter: saturate(180%) blur(20px);

    @include from($bp-md) {
      position: static;
      padding: 0;
      margin: 0 calc(-1 * var(--space-2));
      background: none;
      border: 0;
      backdrop-filter: none;
    }
  }

  &__cancel {
    margin-left: auto;
  }
}
</style>
