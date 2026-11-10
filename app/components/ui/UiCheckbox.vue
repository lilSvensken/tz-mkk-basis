<template>
  <label
    class="ui-checkbox"
    :class="{ 'ui-checkbox--disabled': props.disabled }"
  >
    <input
      v-model="model"
      type="checkbox"
      class="ui-checkbox__input"
      :disabled="props.disabled"
    >
    <span
      class="ui-checkbox__box"
      aria-hidden="true"
    >
      <IconCheck />
    </span>
    <span
      class="ui-checkbox__label"
      :class="{ 'visually-hidden': props.hideLabel }"
    >{{ props.label }}</span>
  </label>
</template>

<script setup lang="ts">
const model = defineModel<boolean>({ required: true })

const props = withDefaults(defineProps<{
  label: string
  hideLabel?: boolean
  disabled?: boolean
}>(), {
  hideLabel: false,
  disabled: false,
})
</script>

<style lang="scss" scoped>
.ui-checkbox {
  --checkbox-size: 1.5rem;

  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  gap: var(--space-2);
  align-items: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &--disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &__input {
    position: absolute;
    top: 0;
    left: 0;
    width: var(--checkbox-size);
    height: var(--checkbox-size);
    margin: 0;
    cursor: inherit;
    opacity: 0;
  }

  &__box {
    --icon-size: 1rem;

    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--checkbox-size);
    height: var(--checkbox-size);
    color: transparent;
    border: 1.5px solid var(--color-text-muted);
    border-radius: var(--radius-round);
    transition: background-color var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast), transform var(--transition-fast);
  }

  &__input:checked + &__box {
    color: var(--color-check);
    background: var(--color-primary);
    border-color: var(--color-primary);
  }

  &__input:active + &__box {
    transform: scale(0.9);
  }

  &__input:focus-visible + &__box {
    @include focus-outline;
  }

  &:hover &__input:not(:disabled, :checked) + &__box {
    border-color: var(--color-primary);
  }
}
</style>
