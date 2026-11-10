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
  gap: $space-2;
  align-items: center;
  padding: $space-8 $space-4;
  text-align: center;
  background: var(--color-surface);
  border: 1px dashed var(--color-border);
  border-radius: $radius-md;

  &__icon {
    width: 48px;
    height: 48px;
    margin-bottom: $space-2;
    color: var(--color-text-muted);
  }

  &__title {
    font-size: 1.125rem;
  }

  &__text {
    max-width: 360px;
    color: var(--color-text-muted);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: $space-2;
    justify-content: center;
    margin-top: $space-3;
  }
}
</style>
