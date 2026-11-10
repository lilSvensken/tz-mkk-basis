<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md'
  type?: 'button' | 'submit' | 'reset'
  to?: RouteLocationRaw
  block?: boolean
  icon?: boolean
}>(), {
  variant: 'secondary',
  size: 'md',
  type: 'button',
  to: undefined,
  block: false,
  icon: false,
})

const NuxtLink = resolveComponent('NuxtLink')
</script>

<template>
  <component
    :is="props.to ? NuxtLink : 'button'"
    :to="props.to"
    :type="props.to ? undefined : props.type"
    class="ui-button"
    :class="[
      `ui-button--${props.variant}`,
      `ui-button--${props.size}`,
      { 'ui-button--block': props.block, 'ui-button--icon': props.icon },
    ]"
  >
    <slot />
  </component>
</template>

<style lang="scss" scoped>
.ui-button {
  display: inline-flex;
  flex-shrink: 0;
  gap: $space-2;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 $space-4;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  text-decoration: none;
  cursor: pointer;
  user-select: none;
  border: 1px solid transparent;
  border-radius: $radius-sm;
  transition: background-color $transition-fast, border-color $transition-fast, color $transition-fast;

  @include focus-ring;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &--sm {
    min-height: 32px;
    padding: 0 $space-3;
    font-size: 0.875rem;
  }

  &--icon {
    width: 40px;
    padding: 0;

    &.ui-button--sm {
      width: 32px;
    }
  }

  &--block {
    width: 100%;
  }

  &--primary {
    color: var(--color-on-primary);
    background: var(--color-primary);

    &:hover:not(:disabled) {
      background: var(--color-primary-hover);
    }
  }

  &--secondary {
    color: var(--color-text);
    background: var(--color-surface);
    border-color: var(--color-border);

    &:hover:not(:disabled) {
      border-color: var(--color-text-muted);
    }
  }

  &--danger {
    color: var(--color-on-primary);
    background: var(--color-danger);

    &:hover:not(:disabled) {
      background: var(--color-danger-hover);
    }
  }

  &--ghost {
    color: var(--color-text-muted);
    background: transparent;

    &:hover:not(:disabled) {
      color: var(--color-text);
      background: var(--color-bg);
    }
  }

  :deep(svg) {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
  }
}
</style>
