<script setup lang="ts">
import { useNotesStore } from '~/stores/notes'

const store = useNotesStore()

useHead({ title: 'Заметки' })
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
        <NuxtLink :to="`/notes/${note.id}`">
          {{ note.title }}
        </NuxtLink>
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
    padding: 0;
    margin: 0;
    list-style: none;
  }
}
</style>
