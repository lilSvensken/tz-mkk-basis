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
        >
          <IconCheck />
        </span>
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

<style lang="scss" scoped>
.note-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  height: 100%;
  padding: var(--space-5) var(--space-5) var(--space-3);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  transition: box-shadow var(--transition-base), transform var(--transition-base);

  @media (hover: hover) {
    &:hover {
      box-shadow: var(--shadow-card-hover);
      transform: translateY(-2px);
    }
  }

  &:has(.note-card__link:focus-visible) {
    @include focus-outline;
  }

  &__title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    line-height: 1.3;
    overflow-wrap: anywhere;
  }

  &__link {
    color: var(--color-accent-text);
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
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
  }

  &__todos {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: 0;
    margin: var(--space-1) 0 0;
    list-style: none;
  }

  &__todo {
    display: flex;
    gap: var(--space-3);
    align-items: center;
    min-width: 0;
    font-size: var(--font-size-md);

    &--done .note-card__text {
      color: var(--color-text-muted);
    }

    &--done .note-card__mark {
      color: var(--color-check);
      background: var(--color-primary);
      border-color: var(--color-primary);
    }
  }

  &__mark {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    --icon-size: 0.8125rem;

    width: 1.25rem;
    height: 1.25rem;
    color: transparent;
    border: 1.5px solid var(--color-text-muted);
    border-radius: var(--radius-round);
  }

  &__text {
    @include truncate;
  }

  &__empty,
  &__more {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
  }

  &__actions {
    position: relative;
    z-index: 1;
    display: flex;
    gap: var(--space-1);
    justify-content: flex-end;
    margin: auto calc(-1 * var(--space-2)) 0 0;
    padding-top: var(--space-2);
  }
}
</style>
