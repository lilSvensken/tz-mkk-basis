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

<style lang="scss" scoped>
.ui-button {
  display: inline-flex;
  flex-shrink: 0;
  gap: var(--space-2);
  align-items: center;
  justify-content: center;
  min-height: var(--control-height);
  padding: 0 var(--space-4);
  font-size: var(--font-size-base);
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  text-decoration: none;
  cursor: pointer;
  user-select: none;
  background: transparent;
  border: 0;
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-fast), color var(--transition-fast), opacity var(--transition-fast);
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
    min-height: var(--control-height-sm);
    padding: 0 var(--space-3);
    font-size: var(--font-size-md);
  }

  &--icon {
    width: var(--control-height);
    padding: 0;
  }

  &--icon#{&}--sm {
    width: var(--control-height-sm);
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
    color: var(--color-on-danger);
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
}
</style>
