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
      <svg
        viewBox="0 0 16 16"
        fill="none"
      >
        <path
          d="M4.5 8.5l2.5 2.5 4.5-5.5"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
    <span
      class="ui-checkbox__label"
      :class="{ 'visually-hidden': props.hideLabel }"
    >{{ props.label }}</span>
  </label>
</template>

<style lang="scss" scoped>
.ui-checkbox {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  gap: $space-2;
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
    width: 24px;
    height: 24px;
    margin: 0;
    cursor: inherit;
    opacity: 0;
  }

  &__box {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    color: transparent;
    border: 1.5px solid var(--color-text-muted);
    border-radius: 50%;
    transition: background-color $transition-fast, border-color $transition-fast, color $transition-fast, transform $transition-fast;

    svg {
      width: 16px;
      height: 16px;
    }
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
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }

  &:hover &__input:not(:disabled, :checked) + &__box {
    border-color: var(--color-primary);
  }
}
</style>
