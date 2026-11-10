<template>
  <section class="notes-page">
    <div class="notes-page__head">
      <div>
        <h1 class="notes-page__title">
          Заметки
        </h1>
        <p
          v-if="store.notes.length > 0"
          class="notes-page__count"
        >
          {{ countLabel }}
        </p>
      </div>
      <UiButton
        v-if="store.notes.length > 0"
        variant="ghost"
        to="/notes/new"
        class="notes-page__new"
      >
        <IconCompose />
        Новая заметка
      </UiButton>
    </div>

    <EmptyState
      v-if="store.notes.length === 0"
      title="Заметок пока нет"
      text="Создайте первую заметку и добавьте в неё список дел."
    >
      <UiButton
        variant="primary"
        to="/notes/new"
      >
        Создать заметку
      </UiButton>
    </EmptyState>

    <ul
      v-else
      class="notes-page__list"
    >
      <li
        v-for="note in store.sortedNotes"
        :key="note.id"
      >
        <NoteCard :note="note">
          <template #actions>
            <UiButton
              size="sm"
              variant="ghost"
              :to="`/notes/${note.id}`"
            >
              Изменить
            </UiButton>
            <UiButton
              size="sm"
              variant="ghost"
              :aria-label="`Удалить заметку «${displayTitle(note.title)}»`"
              @click="removeNote(note)"
            >
              Удалить
            </UiButton>
          </template>
        </NoteCard>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { Note } from '~/types/note'
import { useNotesStore } from '~/stores/notes'
import { displayTitle } from '~/utils/noteContent'
import { pluralize } from '~/utils/plural'

const store = useNotesStore()
const confirm = useConfirm()

useHead({ title: 'Заметки' })

const countLabel = computed(() => {
  const count = store.notes.length
  return `${count} ${pluralize(count, ['заметка', 'заметки', 'заметок'])}`
})

async function removeNote(note: Note) {
  const ok = await confirm({
    title: 'Удалить заметку?',
    message: `Заметка «${displayTitle(note.title)}» будет удалена без возможности восстановления.`,
    confirmText: 'Удалить',
    danger: true,
  })
  if (!ok) return
  store.remove(note.id)
  await nextTick()
  document.querySelector<HTMLElement>('.note-card__link, .notes-page__new, .notes-page .ui-button--primary')?.focus()
}
</script>

<style lang="scss" scoped>
.notes-page {
  &__head {
    display: flex;
    flex-wrap: wrap;
    gap: $space-3;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: $space-6;
  }

  &__title {
    margin: 0;
  }

  &__count {
    margin-top: $space-1;
    font-size: 0.9375rem;
    color: var(--color-text-muted);
  }

  &__new {
    margin-right: -$space-3;
  }

  &__list {
    display: grid;
    grid-template-columns: 1fr;
    gap: $space-4;
    padding: 0;
    margin: 0;
    list-style: none;

    @include from($bp-sm) {
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    }
  }
}
</style>
