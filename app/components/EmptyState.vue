<template>
  <div class="empty-state">
    <svg
      class="empty-state__icon"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="10"
        y="6"
        width="28"
        height="36"
        rx="4"
        stroke="currentColor"
        stroke-width="2.5"
      />
      <path
        d="M17 17h14M17 24h14M17 31h8"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
      />
    </svg>
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
