<script setup lang="ts">
import type { Note } from '~/types/note'
import { displayTitle } from '~/utils/noteContent'

const PREVIEW_LIMIT = 3

const props = defineProps<{ note: Note }>()

const titleId = useId()
const untitled = computed(() => props.note.title.trim() === '')
const preview = computed(() => props.note.todos.slice(0, PREVIEW_LIMIT))
const hiddenCount = computed(() => Math.max(props.note.todos.length - PREVIEW_LIMIT, 0))
const doneCount = computed(() => props.note.todos.filter(todo => todo.done).length)
</script>

<template>
  <article
    class="note-card"
    :aria-labelledby="titleId"
  >
    <h2
      :id="titleId"
      class="note-card__title"
    >
      <NuxtLink
        :to="`/notes/${props.note.id}`"
        class="note-card__link"
        :class="{ 'note-card__link--untitled': untitled }"
      >
        {{ displayTitle(props.note.title) }}
      </NuxtLink>
    </h2>

    <p
      v-if="props.note.todos.length > 0"
      class="note-card__progress"
    >
      Выполнено {{ doneCount }} из {{ props.note.todos.length }}
    </p>

    <ul
      v-if="preview.length > 0"
      class="note-card__todos"
    >
      <li
        v-for="todo in preview"
        :key="todo.id"
        class="note-card__todo"
        :class="{ 'note-card__todo--done': todo.done }"
      >
        <span
          class="note-card__mark"
          aria-hidden="true"
        />
        <span class="visually-hidden">{{ todo.done ? 'Выполнено:' : 'Не выполнено:' }}</span>
        <span class="note-card__text">{{ todo.text }}</span>
      </li>
    </ul>
    <p
      v-else
      class="note-card__empty"
    >
      Пунктов пока нет
    </p>

    <p
      v-if="hiddenCount > 0"
      class="note-card__more"
    >
      и ещё {{ hiddenCount }}
    </p>

    <div
      v-if="$slots.actions"
      class="note-card__actions"
    >
      <slot name="actions" />
    </div>
  </article>
</template>

<style lang="scss" scoped>
.note-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: $space-2;
  height: 100%;
  padding: $space-4 $space-5;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: $radius-md;
  box-shadow: var(--shadow-card);
  transition: border-color $transition-fast;

  &:hover {
    border-color: var(--color-primary);
  }

  &:has(.note-card__link:focus-visible) {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }

  &__title {
    font-size: 1.125rem;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  &__link {
    color: var(--color-text);
    text-decoration: none;
    outline: none;

    &--untitled {
      color: var(--color-text-muted);
      font-style: italic;
    }

    &::after {
      position: absolute;
      inset: 0;
      content: '';
      border-radius: inherit;
    }
  }

  &__progress {
    font-size: 0.8125rem;
    color: var(--color-text-muted);
  }

  &__todos {
    display: flex;
    flex-direction: column;
    gap: $space-1;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  &__todo {
    display: flex;
    gap: $space-2;
    align-items: center;
    min-width: 0;
    font-size: 0.9375rem;

    &--done .note-card__text {
      color: var(--color-text-muted);
      text-decoration: line-through;
    }

    &--done .note-card__mark {
      background: var(--color-primary);
      border-color: var(--color-primary);
    }
  }

  &__mark {
    flex-shrink: 0;
    width: 12px;
    height: 12px;
    border: 2px solid var(--color-text-muted);
    border-radius: 3px;
  }

  &__text {
    @include truncate;
  }

  &__empty,
  &__more {
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  &__actions {
    position: relative;
    z-index: 1;
    display: flex;
    gap: $space-2;
    justify-content: flex-end;
    padding-top: $space-2;
    margin-top: auto;
  }
}
</style>
