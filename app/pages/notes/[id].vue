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

      <ul class="note-page__todos">
        <li
          v-for="todo in content.todos"
          :key="todo.id"
        >
          {{ todo.text }}
        </li>
      </ul>
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

  &__status {
    min-height: 1.5em;
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
    padding: 0;
    margin: 0;
    list-style: none;
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
