<template>
  <div class="empty-state">
    <IconNotes class="empty-state__icon" />
    <h2 class="empty-state__title">
      {{ props.title }}
    </h2>
    <p
      v-if="props.text"
      class="empty-state__text"
    >
      {{ props.text }}
    </p>
    <div
      v-if="$slots.default"
      class="empty-state__actions"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  text?: string
}>()
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  align-items: center;
  padding: var(--space-8) var(--space-4);
  text-align: center;
  background: var(--color-surface);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);

  &__icon {
    --icon-size: 3rem;

    margin-bottom: var(--space-2);
    color: var(--color-text-muted);
  }

  &__title {
    font-size: var(--font-size-lg);
  }

  &__text {
    max-width: 22.5rem;
    color: var(--color-text-muted);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    justify-content: center;
    margin-top: var(--space-3);
  }
}
</style>
