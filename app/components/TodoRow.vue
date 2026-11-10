<template>
  <li
    class="todo-row"
    :class="{ 'todo-row--done': props.todo.done }"
  >
    <UiCheckbox
      :model-value="props.todo.done"
      :label="`Пункт ${props.index + 1} выполнен`"
      hide-label
      @update:model-value="emit('toggle')"
    />
    <UiInput
      ref="input"
      :model-value="props.todo.text"
      :label="`Пункт ${props.index + 1}`"
      hide-label
      plain
      placeholder="Новый пункт"
      @update:model-value="emit('update:text', $event)"
      @blur="emit('commit')"
      @keydown="onKeydown"
    />
    <UiButton
      variant="ghost"
      size="sm"
      icon
      class="todo-row__remove"
      :aria-label="`Удалить пункт ${props.index + 1}`"
      @click="emit('remove')"
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M5 5l10 10M15 5L5 15"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </UiButton>
  </li>
</template>

<script setup lang="ts">
import type { TodoItem } from '~/types/note'

const props = defineProps<{
  todo: TodoItem
  index: number
}>()

const emit = defineEmits<{
  'toggle': []
  'update:text': [value: string]
  'commit': []
  'remove': []
  'enter': []
  'removeEmpty': []
}>()

const input = ref<{ focus: () => void } | null>(null)

function onKeydown(event: KeyboardEvent) {
  if (event.isComposing) return
  if (event.key === 'Enter') {
    event.preventDefault()
    emit('enter')
  }
  else if (event.key === 'Backspace' && props.todo.text === '') {
    event.preventDefault()
    emit('removeEmpty')
  }
}

defineExpose({
  focus: () => input.value?.focus(),
})
</script>

<style lang="scss" scoped>
.todo-row {
  display: flex;
  gap: $space-2;
  align-items: center;
  padding-left: $space-1;

  > .ui-input {
    flex: 1;
  }

  &--done :deep(.ui-input__field) {
    color: var(--color-text-muted);
  }

  &__remove {
    color: var(--color-text-muted);
    opacity: 0;

    .todo-row:hover &,
    .todo-row:focus-within &,
    &:focus-visible {
      opacity: 1;
    }

    @media (hover: none) {
      width: 40px;
      min-height: 40px;
      opacity: 1;
    }
  }
}
</style>
