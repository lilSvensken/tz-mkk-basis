<script setup lang="ts">
import type { Note } from '~/types/note'
import { useNotesStore } from '~/stores/notes'

const store = useNotesStore()
const confirm = useConfirm()

useHead({ title: 'Заметки' })

async function removeNote(note: Note) {
  const ok = await confirm({
    title: 'Удалить заметку?',
    message: `Заметка «${note.title}» будет удалена без возможности восстановления.`,
    confirmText: 'Удалить',
    danger: true,
  })
  if (ok) store.remove(note.id)
}
</script>

<template>
  <section class="notes-page">
    <div class="notes-page__head">
      <h1 class="notes-page__title">
        Заметки
      </h1>
      <UiButton
        variant="primary"
        to="/notes/new"
      >
        Новая заметка
      </UiButton>
    </div>

    <ul class="notes-page__list">
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
              :aria-label="`Удалить заметку «${note.title}»`"
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

<style lang="scss" scoped>
.notes-page {
  &__head {
    display: flex;
    flex-wrap: wrap;
    gap: $space-3;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $space-6;
  }

  &__title {
    margin: 0;
  }

  &__list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: $space-4;
    padding: 0;
    margin: 0;
    list-style: none;
  }
}
</style>
