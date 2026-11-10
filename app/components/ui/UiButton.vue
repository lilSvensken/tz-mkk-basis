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
  min-height: 44px;
  padding: 0 $space-4;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  text-decoration: none;
  cursor: pointer;
  user-select: none;
  background: transparent;
  border: 0;
  border-radius: $radius-sm;
  transition: background-color $transition-fast, color $transition-fast, opacity $transition-fast;
  -webkit-tap-highlight-color: transparent;

  @include focus-ring;

  &:disabled {
    cursor: default;
    opacity: 0.35;
  }

  &:active:not(:disabled) {
    opacity: 0.6;
  }

  &--sm {
    min-height: 36px;
    padding: 0 $space-3;
    font-size: 0.9375rem;
  }

  &--icon {
    width: 44px;
    padding: 0;

    &.ui-button--sm {
      width: 36px;
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
    background: var(--color-fill);

    &:hover:not(:disabled) {
      background: var(--color-border);
    }
  }

  &--danger {
    color: #ffffff;
    background: var(--color-danger);

    &:hover:not(:disabled) {
      background: var(--color-danger-hover);
    }
  }

  &--ghost {
    color: var(--color-accent-text);

    &:hover:not(:disabled) {
      background: var(--color-fill);
    }
  }

  :deep(svg) {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
  }
}
</style>
